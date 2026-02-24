/*

Requirements:

One FeedItem per entityId

latestTs = max ts

unreadCount = ts > readState[id] ?? 0

Sorted by latestTs descending (newest first)

Constraints:

Aggregation must be O(n)

Sorting cost will be O(k log k) — that’s unavoidable

No sorting the original events

Before coding, answer this:

If k (distinct entityIds) is much smaller than n (events), what is total time complexity?

*/

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response = await fetch(url, { signal });
  if (!response.ok) {
    throw `Error fetching data from url ${url}`;
  }
  return response.json();
}
