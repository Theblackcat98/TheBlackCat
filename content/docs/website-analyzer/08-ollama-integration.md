---
title: Ollama LLM Integration
date: '2025-05-21T17:06:27Z'
draft: false
authors:
  - name: theblackcat98
    link: https://github.com/theblackcat98
    image: https://github.com/theblackcat98.png
tags:
  - Project
  - Guide
  - AI
excludeSearch: true
---

# Chapter 8: Ollama LLM Integration

Welcome back! In the last two chapters, we saw how our Website Analyzer generated structured **Business Specifications** and **Brand Specifications** ([Chapter 6](06_specification_generation_.md)) and then used these specs to create a final HTML report ([Chapter 7](07_html_summary_generation_.md)).

You might have noticed that these steps required more than just collecting data. They involved summarizing, synthesizing, and even making educated guesses based on the extracted information. For example, how do you turn a list of products and testimonials into a description of a business's target audience or its brand personality? This isn't a simple data lookup; it requires analysis and inference.

This is where we introduce our intelligent helper: a **Large Language Model (LLM)**. Think of an LLM as an AI assistant that can read, understand, and generate human-like text. It's like having a super-smart intern on your analysis team.

### The Central Use Case: Having an AI Assistant

The core use case for integrating an LLM in our project is to act as an intelligent assistant that you can feed information and ask to perform complex text-based tasks. You give it the raw ingredients (extracted website data) and ask it to write specific sections of your report, summarize key findings, or generate structured specifications.

Specifically, the LLM helps us with tasks like:

*   Analyzing the extracted content and design data to write the Business and Brand Specifications.
*   Potentially generating the final HTML summary report content based on those specifications.

Instead of writing complex, brittle code with lots of rules to figure out a business's target audience, we can give the LLM the business info, content snippets, and product lists and ask *it* to figure out the target audience and describe it.

### What is Ollama LLM Integration?

In our project, we use **Ollama** as the tool to run Large Language Models. Ollama is a fantastic way to run powerful LLMs right on your own computer (or a server), often using models like Llama 2, Mistral, or, in our project's configuration examples, `phi4`.

**Ollama LLM Integration** means connecting our Python code in the Website Analyzer project to an Ollama server that is running an LLM. Our code sends data and instructions (called "prompts") to Ollama, and Ollama sends back the generated text from the LLM.

Think of it like this:

*   Our Python code is like a project manager.
*   Ollama is the desk where the AI assistant (the LLM) sits.
*   `call_llm` (a function we'll see) is the way the project manager (`our code`) gives instructions and data (`prompts`) to the AI assistant (`LLM via Ollama`).
*   The AI assistant (LLM) reads the instructions and data and writes a response (`generated text`).
*   The project manager (`our code`) receives the response and uses it.

The integration part is setting up the communication channel so our Python code can easily talk to the Ollama server.

### The Key Component: The `call_llm` Utility

To make it easy for any part of our project to talk to the LLM, we have a dedicated utility function: `call_llm`.

This function is designed to be the *only* place in the code that knows *how* to talk to Ollama. Any node or utility that needs the LLM's help simply calls `call_llm`, providing the necessary information as a prompt.

You can see the definition of this function in files like `utils/call_llm.py` or used directly in `utils/generate_specs.py` and `generate_llm_summary.py`.

Here's the basic idea of how you use it:

```python
# Conceptual use of call_llm
from utils.call_llm import call_llm # Assuming call_llm is here

# This is the instruction and data you give the LLM
my_question_for_ai = "Summarize the following text: 'The quick brown fox jumps over the lazy dog.'"

# Call the utility function
ai_response = call_llm(my_question_for_ai)

print("AI Assistant says:", ai_response)
```

**Explanation:**

1.  You define the `prompt` string. This is the core instruction for the LLM, often including the data it needs to process.
2.  You call the `call_llm` function, passing your `prompt`.
3.  The `call_llm` function handles sending this prompt to Ollama.
4.  It waits for Ollama (running the LLM) to process the prompt and generate a response.
5.  It returns the generated text response as a string.

Some versions of `call_llm` might also accept a `system_message`. This is like giving the AI assistant a role or specific instructions on *how* to respond (e.g., "You are a helpful assistant.", "Only respond in JSON format.").

```python
# Using system_message with call_llm (as seen in generate_specs.py)
from utils.generate_specs import call_llm # Or import from wherever it's defined

data = {"business_name": "Acme Corp", "colors": ["blue", "white"]}
prompt = f"Based on this data, suggest brand personality traits: {data}"
system_message = "You are a brand consultant. Output a list of traits."

ai_response = call_llm(prompt, system_message)

print("Brand Consultant says:", ai_response)
# Expected output might be something like: "['Reliable', 'Professional', 'Modern']" (or similar)
```

### Where is `call_llm` Used in the Project?

The `call_llm` utility is primarily used in the parts of the flow that require the LLM's analytical and generation capabilities:

1.  **Specification Generation ([Chapter 6](06_specification_generation_.md)):** The `generate_business_spec` and `generate_brand_spec` functions within `utils/generate_specs.py` heavily rely on `call_llm`. They gather the extracted data, format it into a prompt with specific instructions (including a system message to act as a business/brand analyst), and then call `call_llm` to get the LLM's analysis. The LLM is instructed to return the specifications in JSON format, which these functions then parse.

    ```python
    # Simplified snippet from utils/generate_specs.py
    # ... inside generate_business_spec(content_data, design_data, sitemap_data) ...
    
    input_data_for_llm = { ... prepared data dictionary ... }
    
    prompt = f"""
    Analyze this data and generate a Business Specification in JSON:
    {json.dumps(input_data_for_llm, indent=2)}
    ... include formatting instructions ...
    """
    
    system_message = "You are a business analyst. Only output JSON."
    
    # *** CALL THE LLM UTILITY HERE ***
    llm_response_text = call_llm(prompt, system_message)
    
    # ... parse llm_response_text (expected JSON) ...
    ```

2.  **HTML Summary Generation ([Chapter 7](07_html_summary_generation_.md)):** The LLM-based approach for generating the final HTML report (often handled by a script like `generate_llm_summary.py` which is called by the node or an intermediary utility) also uses `call_llm`. It takes the structured specifications, crafts a prompt asking the LLM to generate the full HTML code for a report page, and calls `call_llm`.

    ```python
    # Simplified snippet from generate_llm_summary.py (or similar)
    # ... inside a function like generate_html_from_specs_llm(specs_data) ...
    
    specs_json_string = json.dumps(specs_data, indent=2)
    
    prompt = f"""
    Generate a complete, styled HTML page summarizing this data:
    {specs_json_string}
    ... include instructions for HTML structure and style ...
    Output ONLY the HTML code, no extra text.
    """
    
    # *** CALL THE LLM UTILITY HERE ***
    html_content = call_llm(prompt) 
    
    # ... the node/utility receives html_content and saves it ...
    ```

In both cases, the pattern is the same: prepare the input data, format the request as a prompt for `call_llm`, call `call_llm`, and then process the text response received from the LLM.

### How `call_llm` Works Under the Hood

The `call_llm` utility function is the bridge between our Python code and the Ollama server. It handles the technical details of sending the prompt and receiving the response using web requests.

Here's a simplified sequence diagram:

```mermaid
sequenceDiagram
    participant Calling Code (e.g., GenerateSpecs)
    participant call_llm utility
    participant Ollama Server
    participant LLM (inside Ollama)

    Calling Code (e.g., GenerateSpecs)->>call_llm utility: call_llm(prompt, system_message)
    call_llm utility->>call_llm utility: Prepare API request data (model, prompt, stream=False etc.)
    call_llm utility->>Ollama Server: Send HTTP POST request (API call)
    Ollama Server->>LLM (inside Ollama): Process prompt
    LLM (inside Ollama)-->>Ollama Server: Return generated text
    Ollama Server-->>call_llm utility: Send HTTP response (JSON with text)
    call_llm utility->>call_llm utility: Extract text from JSON response
    call_llm utility-->>Calling Code (e.g., GenerateSpecs): Return generated text string
```

This diagram shows that `call_llm` is the intermediary. It translates the simple function call from our analysis code into the specific HTTP request that Ollama understands and translates the HTTP response back into a simple text string for our code.

Let's look at a simplified version of the `call_llm` implementation (using the `requests` library for HTTP calls, as seen in `utils/generate_specs.py` or `generate_llm_summary.py`):

```python
# Simplified snippet from utils/generate_specs.py (or similar call_llm)
import requests
import os # Used to read environment variables
import logging # For errors

def call_llm(prompt, system_message="You are a helpful assistant."):
    """
    Calls Ollama API to process text.
    """
    # --- 1. Get Ollama server URL and model name ---
    # These are read from environment variables (explained below)
    api_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434") + "/api/generate"
    model_name = os.environ.get("OLLAMA_MODEL", "llama2") 
    
    # --- 2. Prepare the data payload for the HTTP request ---
    # Ollama's API expects a JSON object
    data = {
        "model": model_name,
        "prompt": prompt,
        "system": system_message,
        "stream": False # We want the full response at once
        # There can be other parameters like temperature, top_k, etc.
    }
    
    try:
        # --- 3. Send the POST request to the Ollama API ---
        logging.info(f"Sending prompt to Ollama model: {model_name}")
        response = requests.post(api_url, json=data)
        
        # Check for HTTP errors (like server not found, 404, 500)
        response.raise_for_status() 
        
        # --- 4. Process the response ---
        result = response.json() # Parse the JSON response from Ollama
        
        # Extract the generated text from the JSON result
        generated_text = result.get("response", "") 
        
        logging.info("Received response from LLM.")
        return generated_text # Return the text
        
    except requests.exceptions.RequestException as e:
        # --- 5. Handle errors ---
        logging.error(f"Error calling Ollama: {str(e)}")
        return f"Error: Could not communicate with LLM. {str(e)}" # Return error message
```

**Explanation:**

1.  It first figures out the URL of the Ollama server and the name of the LLM model it should use by reading environment variables (like `OLLAMA_BASE_URL` and `OLLAMA_MODEL`).
2.  It prepares a Python dictionary `data` containing the model name, the user `prompt`, the `system_message`, and sets `stream` to `False` (meaning wait for the full response). This dictionary will be sent to Ollama as JSON.
3.  `requests.post(api_url, json=data)` sends an HTTP POST request to the Ollama server's `/api/generate` endpoint. The `json=data` part automatically converts the Python dictionary into a JSON string for the request body.
4.  `response.raise_for_status()` checks the HTTP status code. If it's an error (e.g., 404, 500), it raises an exception, which jumps to the `except` block.
5.  If successful, `response.json()` parses the JSON received back from Ollama into a Python dictionary. The generated text from the LLM is typically in the `"response"` key of this dictionary.
6.  The value of the `"response"` key is extracted and returned.
7.  If any `requests.exceptions.RequestException` occurs (network error, connection refused, bad status code), the `except` block catches it, logs an error, and returns an error message string.

This utility centralizes the complexity of talking to Ollama, hiding it behind a simple function call for the rest of the project.

You might see slight variations of this `call_llm` function in different files (`utils/call_llm.py`, `utils/generate_specs.py`, `generate_llm_summary.py`) depending on how the project is structured or if specific nodes need slightly different call parameters, but the core logic of preparing the request and calling the Ollama API remains the same. The dedicated `utils/call_llm.py` file is intended to be the standard way, offering a simple wrapper around the Ollama Python library directly, which is another way to interact with Ollama. The underlying principle is the same: hide the API details.

### Configuration with Environment Variables

The `call_llm` utility needs to know *where* Ollama is running (the base URL, usually `http://localhost:11434`) and *which* LLM model to use (e.g., `phi4:latest`, `llama2`). This information is not hardcoded directly into the `call_llm` function but is read from **environment variables**.

Environment variables are settings outside your script that can change depending on where the script is run. A common way to manage these for development is using a `.env` file in the root directory of the project.

The project typically uses the `python-dotenv` library (or similar) to load these variables when the script starts. You would create a `.env` file like this:

```dotenv
# .env file in the root of the project
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi4:latest
```

The `call_llm` function uses `os.environ.get("VARIABLE_NAME", "default_value")` to read these values. `os.environ.get()` is safer than `os.environ["VARIABLE_NAME"]` because it returns a default value if the variable is not set, preventing errors.

This makes the project flexible. If you run Ollama on a different machine or port, or want to use a different model, you just update the `.env` file without changing any Python code.

### Why Ollama?

Using Ollama provides several benefits for a project like this:

*   **Local Execution:** You can run powerful LLMs locally on your own hardware, which is great for privacy (data doesn't leave your machine) and potentially speed (no network latency if running locally).
*   **Offline Capability:** Once the model is downloaded via Ollama, the analysis can be performed without an internet connection (though fetching website content still needs one).
*   **Flexibility:** Ollama supports many different open-source models. You can easily switch models by changing the `OLLAMA_MODEL` environment variable to experiment with different LLMs.
*   **Control:** You have direct control over the LLM and its configuration.

### Conclusion

Ollama LLM Integration is the crucial layer that allows our Website Analyzer to perform intelligent text analysis and generation tasks. By centralizing the communication with an Ollama server via the `call_llm` utility function, the rest of the project can leverage the power of Large Language Models for tasks like generating structured specifications and creating final HTML reports. This utility handles the details of sending prompts (data + instructions) and receiving generated text responses, often configured using environment variables for flexibility. This integration transforms the analyzer from a simple data collector into a system capable of synthesizing insights, acting like an AI assistant for complex analytical steps.

Now that we understand how the LLM helps generate structured output and potentially HTML, we'll look closer at the fallback method for generating the HTML report in the next chapter: [HTML Templating](09_html_templating_.md).

---

<sub><sup>Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge).</sup></sub> <sub><sup>**References**: [[1]](https://github.com/Theblackcat98/Website-Analyzer/blob/3c2ef570c745520cd623f7b5a5f498ba45f1f35c/generate_llm_summary.py), [[2]](https://github.com/Theblackcat98/Website-Analyzer/blob/3c2ef570c745520cd623f7b5a5f498ba45f1f35c/tests/test_llm_generation.py), [[3]](https://github.com/Theblackcat98/Website-Analyzer/blob/3c2ef570c745520cd623f7b5a5f498ba45f1f35c/utils/call_llm.py), [[4]](https://github.com/Theblackcat98/Website-Analyzer/blob/3c2ef570c745520cd623f7b5a5f498ba45f1f35c/utils/generate_specs.py)</sup></sub>