
# Chapter 2: Configuration (Valves)

Welcome back to the Deep Research at Home tutorial! In the last chapter, [The Research Pipe](01_the_research_pipe_.md), we introduced the core idea: the Research Pipe acts like a conductor, orchestrating different tools to perform complex research for you.

But what if you want to tell the conductor *how* to conduct the symphony? Maybe you want the tempo to be faster, certain instruments to play more softly, or perhaps focus only on string instruments for a while. This is where **Configuration (Valves)** comes in.

## What are Valves?

Imagine the Research Pipe isn't just a conductor, but also a complex machine with many dials, switches, and knobs. These controls allow you to fine-tune how the machine operates. In the Deep Research at Home project, we call these controls **Valves**.

Valves are essentially settings or parameters that tell the Research Pipe how to behave. They let you customize things like:

*   Which specific AI models (Large Language Models - LLMs, and Embedding Models) to use for different tasks.
*   How many cycles of research the Pipe should attempt.
*   How many search results to look at for each query.
*   How strictly to filter out irrelevant information.
*   How to handle repeated content or prioritize certain sources.

By adjusting these Valves, you can change the "personality" of the Research Pipe, making it faster, more cautious, more focused, or more expansive, depending on your needs and the topic you're researching.

## Why are Valves Important?

Think about a simple use case: You need a *quick overview* of a topic, not an exhaustive deep dive that takes a long time and uses a lot of processing power.

Without Valves, the Pipe would always run its default, perhaps very thorough, process. But with Valves, you can turn the "Max Cycles" dial down, flip the "Search Results per Query" switch to a lower number, and maybe even enable a "Strict Filtering" valve. This tells the Pipe to do a faster, lighter scan, perfectly suited for your quick overview need.

Or perhaps you have a very powerful computer and access to larger, more capable AI models. You could adjust Valves to use these specific models, enable more rigorous checks (like citation verification), and let the Pipe run more cycles, resulting in a potentially higher-quality, deeper report.

Valves give you the power to adapt the Research Pipe to your specific goal, available resources, and desired output quality.

## How Do You Interact with Valves?

In the Open WebUI environment where Deep Research at Home often runs, you typically won't edit code files directly just to change a setting. Instead, the Valves are exposed through a user interface, often a settings panel specific to the Pipe integration.

Here, you'll see a list of all available Valves, their current values, and usually a brief description of what they do. You can change the values directly through this interface.

When you start a new research query, the Pipe reads the current settings from these Valves and uses them to guide its actions throughout the research process.

## Exploring Some Key Valves

Let's look at a few example Valves to understand the types of controls available.

| Valve Name                  | Type    | Default Example | What it Controls                                                                 | Analogy                 |
| :-------------------------- | :------ | :-------------- | :------------------------------------------------------------------------------- | :---------------------- |
| `ENABLED`                   | Boolean | `True`          | Turns the entire Research Pipe feature on or off.                                | Main Power Switch       |
| `RESEARCH_MODEL`            | String  | `"gemma3:12b"`  | Which specific language model generates queries, analyzes results, and synthesizes. | Engine Type             |
| `MAX_CYCLES`                | Integer | `15`            | The maximum number of research iterations (search, process, analyze) to perform. | Max Speed Limit (sort of) |
| `SEARCH_RESULTS_PER_QUERY`  | Integer | `3`             | How many initial search results to consider for each query.                      | Number of Initial Tabs |
| `QUALITY_FILTER_ENABLED`    | Boolean | `True`          | Whether to use an AI model to filter out irrelevant search results.              | Spam Filter             |
| `QUALITY_SIMILARITY_THRESHOLD`| Float   | `0.60`          | How semantically similar results must be to potentially bypass the quality filter. | Filter Sensitivity      |
| `COMPRESSION_LEVEL`         | Integer | `4`             | How aggressively to summarize and condense retrieved content.                      | Summarization Intensity |
| `VERIFY_CITATIONS`          | Boolean | `True`          | Whether the Pipe attempts to verify facts against sources during synthesis.      | Fact Checker Button     |

*(Note: These are just examples, and the actual Valve names, types, and defaults may vary slightly in the code as the project evolves.)*

Changing `MAX_CYCLES` from 15 to 5 means the Pipe will run fewer search-and-process steps, finishing faster but potentially with a less comprehensive result. Decreasing `SEARCH_RESULTS_PER_QUERY` reduces the amount of raw information processed in each step. Enabling `QUALITY_FILTER_ENABLED` (if it were off) tells the Pipe to use another AI model to check if search results are actually relevant before spending time processing them.

## Under the Hood: Valves in the Code

In the code, Valves are defined within the main `Pipe` class itself, using a nested class called `Valves`. This is a common pattern to keep configuration separate but easily accessible to the main logic.

Let's look at a simplified snippet from the `pipe.py` file:

```python
# ... imports ...
from pydantic import BaseModel, Field

class Pipe:
    # ... other internal variables and methods ...

    # This is where the configuration settings (Valves) are defined
    class Valves(BaseModel):
        # Each setting is a Field with a type, default value, and description
        ENABLED: bool = Field(
            default=True,
            description="Enable Deep Research pipe",
        )
        RESEARCH_MODEL: str = Field(
            default="gemma3:12b",
            description="Model for generating research queries and synthesizing results",
        )
        MAX_CYCLES: int = Field(
            default=15,
            description="Maximum number of research cycles before terminating",
            ge=3, # ge and le specify minimum and maximum allowed values
            le=50,
        )
        SEARCH_RESULTS_PER_QUERY: int = Field(
            default=3,
            description="Base number of search results to use per query",
            ge=1,
            le=10,
        )
        # ... many other configuration options defined here ...

    def __init__(self):
        self.type = "manifold"
        # When the Pipe is created, it loads the default Valve settings
        # or settings provided externally (e.g., from the UI)
        self.valves = self.Valves() 
        # ... other initializations ...

    async def pipe(self, body: dict, __user__: dict, ...):
        # This is the main method where the orchestration happens
        # It reads the Valve settings from self.valves
        if not self.valves.ENABLED: # Check the ENABLED valve
            return "" # If disabled, do nothing

        # ... rest of the pipe logic ...

        # Example of using the MAX_CYCLES valve in a loop condition
        cycle = 1
        while cycle < self.valves.MAX_CYCLES and active_outline:
            # ... research cycle logic ...
            cycle += 1

        # Example of using the RESEARCH_MODEL valve
        # It would be passed to functions like generate_completion:
        # await self.generate_completion(self.valves.RESEARCH_MODEL, ...)

        # Example of using the SEARCH_RESULTS_PER_QUERY valve
        # This would affect how many results are requested from the search function
        # results = await self.search_web(query, count=self.valves.SEARCH_RESULTS_PER_QUERY)

        pass # The actual implementation is long and covers the whole flow
```

In this code:

1.  The `Valves` class, using `pydantic.BaseModel` and `Field`, clearly defines each setting, its type (like `bool` for true/false, `str` for text, `int` for whole numbers), its default value, a helpful description, and sometimes limits (`ge` = greater than or equal to, `le` = less than or equal to).
2.  The `Pipe`'s `__init__` method creates an instance of this `Valves` class and stores it in `self.valves`. When the Pipe is integrated into something like Open WebUI, this initialization is often where the values from the user interface settings are loaded instead of just using the defaults.
3.  Throughout the `pipe` method and other helper methods, the code refers to these settings using `self.valves.VALVE_NAME` (e.g., `self.valves.MAX_CYCLES`, `self.valves.RESEARCH_MODEL`).

This structure makes it easy to see all configuration options in one place (`Valves` class) and allows the rest of the code to simply read the desired setting from `self.valves`.

## Conclusion

In this chapter, we learned that **Valves** are the configuration settings that allow you to control and customize the behavior of the Research Pipe. Like dials on a control panel, they let you adjust various parameters, from the models used to the number of research cycles and the strictness of filtering. Understanding Valves gives you the power to tailor the deep research process to your specific needs.

While Valves control *how* the Research Pipe operates, the Pipe also needs a way to remember *what* it has done and learned throughout a conversation or across multiple research cycles. This is handled by **Research State Management**, which we'll explore in the next chapter.

[Chapter 3: Research State Management](03_research_state_management.md)

---

<sub><sup>Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge).</sup></sub> <sub><sup>**References**: [[1]](https://github.com/atineiatte/deep-research-at-home/blob/bd54417a0423fd4df886f22cf9195952ee72c3b5/pipe)</sup></sub>
````