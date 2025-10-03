# backend/agent_service.py
import os
from dotenv import load_dotenv
from typing import TypedDict, List
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

load_dotenv()

# --- 1. Define the State ---
class GraphState(TypedDict):
    prompt: str
    base64Image: str | None
    framework: str
    system_instruction: str
    model_parts: List
    generated_code: str
    error_message: str | None
    retry_count: int
    intent: str
    chat_response: str

# --- 2. Define the Node Functions ---

def classify_intent_node(state: GraphState):
    """Classifies the user's intent as either 'chat' or 'code_generation'."""
    print("---CLASSIFYING INTENT---")
    
    # --- IMPROVED PROMPT FOR BETTER ACCURACY ---
    classification_prompt = f"""You are a strict intent classifier for a code generation chatbot. Your task is to determine if the user's prompt is an explicit request to generate code, or if it is just a general conversational message.

- If the prompt contains keywords like 'create', 'build', 'generate', 'make', 'design a', 'implement', or is a direct description of a UI component (e.g., 'a login form with two input fields'), you MUST respond with the single word: 'code_generation'.
- If the prompt is a greeting, a question, a statement, or any other general chit-chat (e.g., 'hello', 'how are you?', 'what can you do?'), you MUST respond with the single word: 'chat'.

User prompt: "{state['prompt']}"
Your response:"""

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0)
    
    response = llm.invoke(classification_prompt)
    intent = response.content.strip().lower().replace("'", "").replace('"', '')

    if intent == "chat":
        state["intent"] = "chat"
    else:
        state["intent"] = "code_generation"
    
    print(f"---INTENT: {state['intent']}---")
    return state

def chat_node(state: GraphState):
    """Generates a conversational response to the user's prompt."""
    print("---GENERATING CHAT RESPONSE---")
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.7)
    response_stream = llm.stream(f"You are a helpful AI assistant. Respond to the user's message: {state['prompt']}")
    state["chat_response"] = response_stream
    return state

def prepare_code_prompt_node(state: GraphState):
    """Prepares the input for the Gemini model for code generation."""
    print("---PREPARING CODE PROMPT---")
    parts = [{"type": "text", "text": state["prompt"]}]
    if state["base64Image"]:
        parts.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/png;base64,{state['base64Image']}"}
        })
    state["model_parts"] = parts
    return state

def generate_code_node(state: GraphState):
    """Generates code by calling the Gemini API."""
    print("---GENERATING CODE---")
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.2,
            convert_system_message_to_human=True
        )
        message = HumanMessage(content=state["model_parts"])
        system_message = state["system_instruction"]
        response_stream = llm.stream([system_message, message])
        state["generated_code"] = response_stream
        state["error_message"] = None
    except Exception as e:
        print(f"---ERROR IN GENERATION: {e}---")
        state["error_message"] = str(e)
    return state

def handle_error_node(state: GraphState):
    """Handles errors and decides whether to retry."""
    print("---HANDLING ERROR---")
    error = state.get("error_message", "")
    retries = state.get("retry_count", 0)
    if "503" in error and "overloaded" in error and retries < 3:
        print(f"---MODEL OVERLOADED, RETRYING ({retries + 1})---")
        state["retry_count"] = retries + 1
        return "generate_code"
    else:
        print(f"---UNRECOVERABLE ERROR, ENDING: {error}---")
        state["generated_code"] = f"An error occurred: {error}"
        return END

# --- 3. Build the Graph with Routing Logic ---
workflow = StateGraph(GraphState)

workflow.add_node("classify_intent", classify_intent_node)
workflow.add_node("chat", chat_node)
workflow.add_node("prepare_code_prompt", prepare_code_prompt_node)
workflow.add_node("generate_code", generate_code_node)
workflow.add_node("handle_error", handle_error_node)

workflow.set_entry_point("classify_intent")
workflow.add_conditional_edges("classify_intent", lambda state: state["intent"], { "code_generation": "prepare_code_prompt", "chat": "chat" })
workflow.add_edge("chat", END)
workflow.add_edge("prepare_code_prompt", "generate_code")
workflow.add_conditional_edges("generate_code", lambda state: "handle_error" if state.get("error_message") else END)
workflow.add_edge("handle_error", "generate_code")

app = workflow.compile()

# --- 4. Create FastAPI App to Serve the Agent ---
api = FastAPI()

@api.post("/api/generate")
async def generate(request_data: dict):
    system_instruction = """
    You are CodeCanvas AI. Your task is to act as an expert frontend engineer.
    - For React/Next.js/JSX code, ALWAYS use JSX-style comments: {/* like this */}.
    - For plain HTML code, ALWAYS use HTML-style comments: .
    - Only include the UI structure. Do not include markdown, ```, <head>, <body>, or <html> tags.
    """
    initial_state = {
        "prompt": request_data.get("prompt", ""),
        "base64Image": request_data.get("base64Image"),
        "framework": request_data.get("framework"),
        "system_instruction": system_instruction,
        "retry_count": 0
    }

    async def stream_generator():
        async for chunk in app.astream(initial_state):
            if "chat" in chunk:
                chat_output = chunk["chat"].get("chat_response")
                if chat_output:
                    yield "CHAT:"
                    for token in chat_output:
                        yield token.content
                    return
            if "generate_code" in chunk:
                generate_output = chunk["generate_code"]
                if generate_output and "generated_code" in generate_output and generate_output["generated_code"]:
                    generation_stream = generate_output["generated_code"]
                    yield "CODE:"
                    for token in generation_stream:
                        yield token.content
    
    return StreamingResponse(stream_generator(), media_type="text/plain")