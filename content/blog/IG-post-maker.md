---
title: IG Post Maker
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

# Automated Instagram Post Generation with IG-Post-Agent

Have you ever wished to quickly create engaging Instagram content that includes slide ideas, catchy descriptions, and hashtags—all automatically? The **IG-Post-Agent** project from GitHub (https://github.com/theblackcat98/IG-Post-Agent) makes it possible. Leveraging a multi-agent system built with AutoGen alongside the power of Ollama’s large language model (LLM), this tool lets you generate complete Instagram posts in just a few steps.

## Features

•   Generates 3–5 slide themes for an Instagram post.  
•   Creates a concise sentence per slide designed to grab attention.  
•   Produces an engaging post description with a call-to-action and relevant hashtags.  
•   Formats the final output clearly, separating slides from the overall description.  
•   Saves each generated post into its own text file (named after your topic), ensuring easy retrieval.

## Prerequisites

Before diving in, ensure you have the following installed on your system:
- Python 3.9 or higher
- Conda (or Miniconda) for creating isolated environments
- Ollama LLM: Download and run Ollama from [https://ollama.com/](https://ollama.com/)

## Setup Instructions

1. Clone or download the repository to your local machine.
2. Create and activate a new Conda environment by running:
   ```bash
   conda create -n ig_post_agent python=3.12 -y  
   conda activate ig_post_agent
   ```
3. Install all required dependencies with:
   ```bash
   pip install -r requirements.txt
   ```
4. Make sure your Ollama instance is up and running, then pull the default model by executing:
   ```bash
   ollama pull phi4:latest  
   ```
   You can always change this in the script if you prefer another model.

## Running the Script

1. Activate your environment (if not already active):
   ```bash
   conda activate ig_post_agent
   ```
2. Run the main script:
   ```bash
   python instagram_post_generator.py
   ```
3. When prompted, enter a topic for your Instagram post. For example, “Sustainable Living”. If left blank, it defaults to “The future of renewable energy.”
4. The script will expand your input into 3–5 subtopics and then run through four distinct steps:
   - **Topic Expander Agent** – Breaks down the general topic into specific subtopics.
   - **Planner Agent** – Plans content for each slide (i.e., theme ideas).
   - **Slide Generator Agent** – Crafts a short, compelling sentence for every slide.
   - **Description Generator Agent** – Assembles an engaging post description complete with hashtags and even echoes the slides again.
5. Finally, a **Compiler Agent** neatly formats everything into a final output that is both printed to your terminal and saved as a text file (named after your topic) in the “instagram_posts” directory.

## Customization

Feel free to tweak various settings within the script to suit your needs:
- Change the Ollama model by modifying the `model` key in the `ollama_config` dictionary.
- Adjust the host URL and request timeout parameters if needed (by uncommenting the corresponding lines).
- The structure of agents can be extended or modified for more complex content generation flows.

## How It Works

The **IG-Post-Agent** uses a multi-agent approach where each agent is responsible for one stage of content creation. For example, once you enter your topic:

1. A **Topic Expander Agent** (built with an AssistantAgent) processes the general idea into 3–5 detailed subtopics.
2. The **Planner Agent** then receives each subtopic and generates specific themes or key messages that serve as slide ideas.
3. Next, the **Slide Generator Agent** transforms these themes into single-sentence captions—each one short yet powerful enough to capture an Instagram audience.
4. A **Description Generator Agent** takes all slide sentences and synthesizes them into a coherent post description complete with hashtags.
5. Finally, a **Compiler Agent** arranges the output into two sections:
   - `--- SLIDES ---` listing each slide’s content
   - `--- DESCRIPTION ---` presenting the overall post message and hashtags

The code is written in Python using asynchronous programming (asyncio) to ensure efficient execution. Agents communicate within a directed graph built by AutoGen, which orchestrates each step seamlessly.

## Code Overview

Below is an excerpt from the script that outlines key parts of the process:

```python
import asyncio
import os
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_agentchat.teams import DiGraphBuilder, GraphFlow
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.ollama import OllamaChatCompletionClient

async def main():
    # Configure the Ollama client with model settings.
    ollama_config = {
        "model": "phi4:latest",  # Default model; change as needed.
        # Uncomment and set these if your setup requires:
        # "host": "http://localhost:11434",
        # "timeout": 120,
    }
    
    client_params = {"model": ollama_config["model"]}
    if "host" in ollama_config and ollama_config["host"]:
        client_params["host"] = ollama_config["host"]
    if "timeout" in ollama_config and ollama_config["timeout"]:
        client_params["timeout"] = ollama_config["timeout"]
    model_client = OllamaChatCompletionClient(**client_params)
    
    # Define agents for each stage of post generation:
    topic_expander_agent = AssistantAgent(
        name="TopicExpanderAgent",
        model_client=model_client,
        system_message="""You are a helpful AI assistant specialized in topic expansion.
Given a general topic, break it down into 3-5 more specific subtopics. Output them as a numbered list."""
    )
    
    planner_agent = AssistantAgent(
        name="PlannerAgent",
        model_client=model_client,
        system_message="""Your role is to plan the Instagram post content.
Define between 3 and 5 slide themes with concise key messages for each."""
    )
    
    slide_generator_agent = AssistantAgent(
        name="SlideGeneratorAgent",
        model_client=model_client,
        system_message="""You will be provided a list of themes.
For each theme, write a single compelling sentence to be used as an Instagram slide caption."""
    )
    
    description_generator_agent = AssistantAgent(
        name="DescriptionGeneratorAgent",
        model_client=model_client,
        system_message="""Given the slide sentences, generate an engaging post description with hashtags and a call-to-action.
Also, re-list the slide content at the end."""
    )
    
    compiler_agent = AssistantAgent(
        name="CompilerAgent",
        model_client=model_client,
        system_message="""Format the complete Instagram post by listing slides under '--- SLIDES ---'
and then the post description along with hashtags under '--- DESCRIPTION ---'."""
    )
    
    user_proxy_agent = UserProxyAgent(name="UserProxyAgent")
    
    # Retrieve main topic from input.
    main_topic = input("Enter the main topic for your Instagram posts: ")
    if not main_topic:
        main_topic = "The future of renewable energy"
        print(f"No topic entered, using default: {main_topic}")
        
    print("\nExpanding topic into subtopics...\n")
    
    # Expand topic and process each subtopic.
    expansion_builder = DiGraphBuilder()
    expansion_builder.add_node(topic_expander_agent)
    expansion_builder.set_entry_point(topic_expander_agent)
    expansion_graph = expansion_builder.build()
    expansion_flow = GraphFlow(
        participants=expansion_builder.get_participants(),
        graph=expansion_graph
    )
    
    expansion_result = await expansion_flow.run(task=main_topic)
    subtopics = []
    if expansion_result and expansion_result.messages:
        for message in reversed(expansion_result.messages):
            if hasattr(message, 'source') and message.source == topic_expander_agent.name and hasattr(message, 'content'):
                content_lines = message.content.strip().split('\n')
                for line in content_lines:
                    if line.strip() and any(line.strip().startswith(str(i) + '.') for i in range(1, 10)):
                        subtopic = line.strip().split('.', 1)[1].strip()
                        subtopics.append(subtopic)
                break
    if not subtopics:
        print("No subtopics could be extracted. Using main topic instead.")
        subtopics = [main_topic]
        
    print(f"\nGenerated {len(subtopics)} subtopic(s):")
    for i, subtopic in enumerate(subtopics, 1):
        print(f"{i}. {subtopic}")
    
    # Process each subtopic using a content flow.
    output_dir = "instagram_posts"
    os.makedirs(output_dir, exist_ok=True)
    
    for subtopic in subtopics:
        print(f"\nGenerating Instagram post for subtopic: {subtopic}...\n")
        content_builder = DiGraphBuilder()
        content_builder.add_node(planner_agent)
        content_builder.add_node(slide_generator_agent)
        content_builder.add_node(description_generator_agent)
        content_builder.add_node(compiler_agent)
        
        # Define agent communication flow.
        content_builder.add_edge(planner_agent, slide_generator_agent)
        content_builder.add_edge(slide_generator_agent, description_generator_agent)
        content_builder.add_edge(description_generator_agent, compiler_agent)
        content_builder.set_entry_point(planner_agent)
        
        content_graph = content_builder.build()
        content_flow = GraphFlow(
            participants=content_builder.get_participants(),
            graph=content_graph
        )
        final_response_task_result = await content_flow.run(task=subtopic)
        
        output_content = None
        if final_response_task_result and final_response_task_result.messages:
            for message in reversed(final_response_task_result.messages):
                if hasattr(message, 'source') and message.source == compiler_agent.name and hasattr(message, 'content'):
                    output_content = str(message.content)
                    break
            if output_content:
                print("\n--- INSTAGRAM POST CONTENT ---")
                print(output_content)
                print("--- END OF POST ---\n")
                
                try:
                    safe_topic_chars = [c for c in subtopic if c.isalnum() or c == ' ']
                    topic_text = "".join(safe_topic_chars).strip()
                    words = topic_text.split()
                    short_topic = " ".join(words[:5])
                    safe_topic = short_topic.replace(' ', '_').lower()
                    filename = f"{output_dir}/{safe_topic}_instagram_post.txt"
                    with open(filename, "w", encoding="utf-8") as f:
                        f.write(output_content)
                    print(f"Output saved to: {filename}")
                except Exception as e:
                    print(f"Error saving output: {e}")
            else:
                print("No valid content from CompilerAgent. Check debugging logs below:")
                for i, msg in enumerate(final_response_task_result.messages):
                    source_name = getattr(msg, 'source', 'N/A')
                    msg_type = type(msg).__name__
                    msg_content = getattr(msg, 'content', '<NO CONTENT>')
                    print(f"Message {i}: Source='{source_name}', Type='{msg_type}', Content='{msg_content}'")
        else:
            print("No response from the graph execution.")
    
    print(f"All Instagram posts have been generated and saved in '{output_dir}'.")
    await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())
```

## Conclusion

**IG-Post-Agent** is an innovative tool that combines cutting-edge LLMs with a multi-agent system to automate the creative process behind generating Instagram content. Whether you’re looking for quick marketing material or experimenting with AI-generated social media posts, this project provides a robust starting point. Customize it further as needed and explore how the power of AutoGen and Ollama can transform your workflow.

Happy posting!
```

This Markdown post includes sections with headers, bullet points, code snippets wrapped in triple backticks, and clear instructions for setup and usage. Enjoy!