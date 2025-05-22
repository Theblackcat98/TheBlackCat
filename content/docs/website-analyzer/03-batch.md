---
title: Processing Nodes
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

# Chapter 3: Batch Processing

Welcome back! In the last two chapters, we introduced [Flow Orchestration](01_flow_orchestration_.md) as the conductor of our analysis process and learned about [Processing Nodes](02_processing_nodes_.md) as the individual workers performing specific tasks.

Nodes are great for single steps, like fetching the very first page of a website. But what happens when you need to analyze *many* pages? Or extract data from dozens of different links found on a page? If you only had simple Nodes, you'd need a complicated flow with a separate node for *each* page, which is clearly not practical for large websites.

Imagine our website analysis as a factory assembly line again. A standard Node is like a worker who takes one item, performs a single operation, and passes it on. But what if you have a huge pile of screws that all need the same process applied (like sorting or counting)? You wouldn't want a separate worker for each screw. You'd want a worker who specializes in handling *batches* of screws at once.

This is where **Batch Processing** comes in, handled by a special type of Node: the **`BatchNode`**.

A `BatchNode` is specifically designed to deal with collections of items efficiently. Instead of the `Flow` calling a `Node` for every single page, the `Flow` calls *one* `BatchNode`, and that `BatchNode` takes responsibility for processing a whole group (or batch) of pages. This is crucial for analyzing multiple pages on a website, such as crawling to build a sitemap or extracting information from many discovered URLs.

### What is a `BatchNode`?

A `BatchNode` is a specialized version of the base `Node` we saw in Chapter 2. It inherits all the basic capabilities of a `Node` but adds specific logic to handle lists of items.

Think of it as an assembly line station designed for bulk processing:

1.  **Get the List (Preparation - `prep`):** The `BatchNode` first asks the `shared` data, "What's the list of items I need to work on?" (e.g., "Give me the list of URLs discovered so far that haven't been visited yet"). This is done in its `prep` method.
2.  **Process Each Item (Execution - `exec`):** The `BatchNode` then loops through the list obtained in `prep`, and for *each item* in that list, it calls a specific method, usually called `exec`. This `exec` method contains the logic to process just *one* item (e.g., "Fetch this single URL and find its links").
3.  **Combine Results (Post-Processing - `post`):** After the `BatchNode` has processed *all* items in the batch using `exec`, it gathers all the individual results. It then calls a final method, `post`, where it combines or aggregates these results and updates the `shared` data (e.g., "Here's the complete list of all new links found across all pages in this batch").

The `BatchNode`'s own `run` method (inherited and slightly modified from the base `Node`) orchestrates these steps automatically.

### How a `BatchNode` Works (Simplified)

Let's look at the basic structure and lifecycle of a `BatchNode`.

Unlike a regular `Node` whose main logic is often just in `run` (or `exec`), a `BatchNode` splits its work:

```python
# Simplified BatchNode structure from nodes.py
class BatchNode(Node): # It inherits from Node!
    def prep(self, shared):
        """
        Step 1: Collect the list of items to process from 'shared'.
        Returns: An iterable (like a list) of items.
        """
        print("BatchNode: Preparing list of items...")
        items_to_process = [] # Get items from shared data here...
        return items_to_process 

    def exec(self, item):
        """
        Step 2: Process a single item from the list.
        This method is called repeatedly by the BatchNode's run method.
        Args:
            item: One item from the list returned by prep().
        Returns:
            The result of processing this single item.
        """
        print(f"BatchNode: Processing single item: {item}...")
        result_for_item = f"Processed: {item}" # Do work on item here...
        return result_for_item

    def post(self, shared, prep_res, exec_res_list):
        """
        Step 3: Combine results after all items are processed.
        Args:
            shared (dict): The shared data dictionary.
            prep_res: The list of items returned by prep().
            exec_res_list (list): A list of results from each exec() call.
        Returns:
            str: An action string ("next", "continue", etc.) for the Flow.
        """
        print("BatchNode: Post-processing batch results...")
        # Combine results in exec_res_list and update 'shared' here...
        shared['batch_results'] = exec_res_list # Example: just store the list
        print("BatchNode: Results combined.")
        
        # Return an action, like 'next' to move on, or 'continue' to process another batch
        return "next" 
        
    # The run method is inherited/managed by the base BatchNode/Node classes
    # It calls prep, then loops calling exec for each item, then calls post.
    # You usually don't override run() in your specific BatchNode classes.
    # def run(self, shared): ... calls prep(), then exec() for items, then post() ... 
```

When the `Flow` calls the `run` method of a `BatchNode`:

```mermaid
sequenceDiagram
    participant Flow
    participant BatchNode Instance
    participant Shared Data
    participant Item 1 Processor (exec)
    participant Item 2 Processor (exec)
    participant Item N Processor (exec)

    Flow->>BatchNode Instance: run(shared)
    BatchNode Instance->>Shared Data: Read data needed for item list
    BatchNode Instance->>BatchNode Instance: Call prep(shared)
    BatchNode Instance-->>BatchNode Instance: Returns list of items
    Note over BatchNode Instance: Loops over each item

    BatchNode Instance->>Item 1 Processor (exec): exec(item 1)
    Item 1 Processor (exec)-->>BatchNode Instance: Return result 1
    BatchNode Instance->>Item 2 Processor (exec): exec(item 2)
    Item 2 Processor (exec)-->>BatchNode Instance: Return result 2
    ...
    BatchNode Instance->>Item N Processor (exec): exec(item N)
    Item N Processor (exec)-->>BatchNode Instance: Return result N

    Note over BatchNode Instance: Collects all results (result 1, result 2, ... result N)

    BatchNode Instance->>Shared Data: Write data needed for post-processing
    BatchNode Instance->>BatchNode Instance: Call post(shared, items, results_list)
    Note over BatchNode Instance: Combines results, updates shared
    BatchNode Instance-->>Flow: Return action string ("next" or "continue" etc.)
```

This diagram shows how the `Flow` triggers the `BatchNode`, which then internally manages getting the items (`prep`), processing them one by one (`exec`), and finally collecting everything and deciding the *next* step for the `Flow` (`post`).

### `BatchNode`s in Website Analyzer

Our Website Analyzer project uses `BatchNode`s extensively because analyzing a website involves processing many pages. The main `BatchNode`s are:

| `BatchNode` Type          | What it processes a batch of... | `prep` does this...                                     | `exec` does this for one item...             | `post` does this...                                                                 | Returns action... |
| :------------------------ | :------------------------------ | :------------------------------------------------------ | :------------------------------------------- | :---------------------------------------------------------------------------------- | :---------------- |
| `SitemapBatchNode`        | URLs to crawl                   | Finds next URLs to visit from `pages_to_process` in `shared` | Fetches a URL, finds links/structure        | Updates `sitemap`, adds new links to `pages_to_process`, stores `soups` in `shared` | `"continue"` (if more pages) or `"next"` (if done) |
| `DesignElementsBatchNode` | Visited pages/soups           | Gets list of pages from `sitemap` and `soups` in `shared` | Extracts design data from a single page (`soup`) | Aggregates design data across all pages in `shared['design']`                        | `"next"`          |
| `ContentBatchNode`        | Visited pages/soups           | Gets list of pages from `sitemap` and `soups` in `shared` | Extracts content data from a single page (`soup`) | Aggregates content data across all pages in `shared['content']`                         | `"next"`          |

Let's look at a key example: the `SitemapBatchNode`. This node is responsible for crawling the website page by page to build the sitemap, up to a `max_pages` limit.

Its `prep` method looks into the `shared` data, specifically `shared['pages_to_process']`. This is a list of URLs that have been discovered but not yet visited. `prep` selects a batch of these URLs to process in the current iteration, ensuring it doesn't exceed the `max_pages` limit or visit the same page twice (by checking `shared['pages_visited']`).

Simplified `SitemapBatchNode.prep`:

```python
# From nodes.py (simplified) - inside SitemapBatchNode
    def prep(self, shared):
        """Prepare URLs to crawl."""
        # ... initialization logic (first run) ...
        
        to_process = []
        max_pages = shared.get("max_pages", 20)
        
        # Calculate how many more pages we can visit
        pages_remaining = max_pages - len(shared.get("pages_visited", set()))
        
        # Select URLs from pages_to_process that haven't been visited yet,
        # up to the remaining limit.
        for url in shared["pages_to_process"]:
            if url not in shared.get("pages_visited", set()) and len(to_process) < pages_remaining:
                to_process.append(url)
        
        # Keep track of pages not processed in this batch for the next iteration
        remaining_in_queue = [url for url in shared["pages_to_process"] if url not in to_process and url not in shared.get("pages_visited", set())]
        shared["pages_to_process"] = remaining_in_queue
        
        # to_process is the list of items for *this batch*
        return to_process 
```
This `prep` method returns the list `to_process`, which is the batch of URLs the `BatchNode` will now work on.

The `exec` method of `SitemapBatchNode` is then called for *each* URL in this `to_process` list. It performs the core task for that single URL: fetching its content and finding links within it.

Simplified `SitemapBatchNode.exec`:

```python
# From nodes.py (simplified) - inside SitemapBatchNode
    def exec(self, url):
        """Process a single URL to build sitemap."""
        # Use our utility function to fetch the page content
        soup, status, error = get_website_content(url) 
        
        if error or not soup:
            # Handle fetch errors for this specific URL
            return {"url": url, "error": error or "Failed to fetch content", "links": []}
            
        # Extract basic page structure and links from the soup
        page_structure = { 
            "title": soup.title.string if soup.title else "No title",
            # ... extract headers, paragraph count ...
            "links": [],
            "soup": soup  # Store the soup object for later nodes!
        }
        
        links = []
        # Loop through <a> tags to find internal links
        for link in soup.find_all('a', href=True):
            # ... logic to resolve absolute URL and check if internal ...
            if is_valid_url(absolute_url, shared["base_domain"]): # Access base_domain from shared (simplified)
                links.append(absolute_url)
                page_structure["links"].append(absolute_url)
                
        # Return results for this single URL
        return {"url": url, "structure": page_structure, "links": links, "status": status}
```
This `exec` method does the heavy lifting for one page and returns the extracted information for that page. The `BatchNode`'s internal loop collects these results for all pages in the batch.

Finally, the `post` method of `SitemapBatchNode` runs after all `exec` calls are complete. It receives the list of results from all processed URLs. It updates the main `sitemap` structure in `shared`, adds the processed URLs to `shared['pages_visited']`, and adds any newly discovered, unvisited internal links to `shared['pages_to_process']` for *future* batches. Crucially, it then decides the action for the `Flow`. If there are still URLs left in `shared['pages_to_process']` and we haven't hit the `max_pages` limit, it returns `"continue"`. This tells the `Flow` to run the *same* `SitemapBatchNode` again (which will then execute its `prep` again, pick up the *next* batch of URLs, and repeat the cycle). If there are no more URLs to process or the `max_pages` limit is reached, it returns `"next"`, signalling the `Flow` to move to the next node in the sequence.

Simplified `SitemapBatchNode.post`:

```python
# From nodes.py (simplified) - inside SitemapBatchNode
    def post(self, shared, prep_res, exec_res_list):
        """Update sitemap with processed URLs and discover new ones."""
        sitemap = shared["sitemap"]
        max_pages = shared.get("max_pages", 20)
        
        # Initialize visited set if needed
        if "pages_visited" not in shared:
            shared["pages_visited"] = set()
            
        # Loop through results from *all* exec calls in this batch
        for result in exec_res_list:
            url = result["url"]
            shared["pages_visited"].add(url) # Mark as visited
            
            if "error" not in result:
                page_key = url.replace(sitemap["base_url"], "") or "/"
                sitemap["pages"][page_key] = result["structure"] # Add page data to sitemap
                
                # Store soup for later nodes (Design/Content Batch Nodes)
                if "soups" not in shared:
                    shared["soups"] = {}
                shared["soups"][url] = result["structure"].pop("soup", None) # Store soup, remove from structure
                
                # Add newly found links to the queue if not visited/queued
                for link in result["links"]:
                    if (link not in shared["pages_visited"] and 
                        link not in shared["pages_to_process"]):
                        shared["pages_to_process"].append(link)
        
        # Update shared data with the modified sitemap and queues
        shared["sitemap"] = sitemap
        
        visited_count = len(shared["pages_visited"])
        to_process_count = len(shared["pages_to_process"])
        
        logging.info(f"Sitemap status: {visited_count} pages visited, {to_process_count} pages to process")
        
        # Decide next action for the Flow
        if to_process_count > 0 and visited_count < max_pages:
            logging.info("More pages to process, continuing sitemap construction.")
            return "continue" # Tell Flow to run this node again
        else:
            logging.info("Sitemap construction complete.")
            return "next" # Tell Flow to move to the next node
```

This "continue" action is a powerful pattern enabled by `BatchNode`s. It allows complex, iterative processes like website crawling to be managed within a single node in the Flow definition, rather than needing manual looping logic in the Flow itself or creating complex circular transitions for every single page.

The `DesignElementsBatchNode` and `ContentBatchNode` work similarly. Their `prep` method gets the list of *all visited URLs* (or specifically the `soup` objects for those URLs) from the `shared` data. Their `exec` method then processes the design or content for a *single page* using its `soup`, and their `post` method aggregates the results from all pages into `shared['design']` or `shared['content']`.

### Conclusion

Batch Processing, using `BatchNode`s, is a key abstraction in our Website Analyzer for efficiently handling tasks that involve processing multiple items, like the many pages of a website. `BatchNode`s simplify the Flow by managing the looping and individual item processing internally, exposing just three main steps (`prep`, `exec`, `post`) to the developer implementing the specific batch logic. The `exec` method does the work on a single item, `prep` gathers the items, and `post` aggregates the results and determines the Flow's next step, potentially returning `"continue"` to process another batch.

Understanding `BatchNode`s is essential to see how the project scales to handle larger websites. In the next chapter, we'll dive deeper into one of the core functions performed by these batch nodes: [Website Content Fetching](04_website_content_fetching_.md).

---

<sub><sup>Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge).</sup></sub> <sub><sup>**References**: [[1]](https://github.com/Theblackcat98/Website-Analyzer/blob/3c2ef570c745520cd623f7b5a5f498ba45f1f35c/flow.py), [[2]](https://github.com/Theblackcat98/Website-Analyzer/blob/3c2ef570c745520cd623f7b5a5f498ba45f1f35c/nodes.py), [[3]](https://github.com/Theblackcat98/Website-Analyzer/blob/3c2ef570c745520cd623f7b5a5f498ba45f1f35c/tests/test_flow.py)</sup></sub>