import os
import json

MIN_CHAR = 30

# We only process those names in the watchlist.txt.

# Step 1: Read the watchlist.json file, get the list of names from the "include" field, and put them in the `watchlist` list.
watchlist = []
with open("./watchlist.json", "r") as file:
    content = json.load(file)
    for name in content["include"]:
        watchlist.append(name)

raw_text = []

for filename in os.listdir("./raw"):
    if filename.endswith(".txt") and filename[:-4] in watchlist:
        file_path = "./raw/" + filename

        # Read one person's data
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()

            # Processing: Read the file and split it into entries using the "------" separator.
            entries = content.split("------")

            # Processing: Remove duplicates while preserving the order.
            unique_entries = []
            seen = set()

            for entry in entries:
                # Promote the length check earlier. Word count based on mood.
                if len(entry) > MIN_CHAR:
                    stripped_entry = (
                        entry.strip()
                    )  # Remove leading and trailing whitespaces
                    if stripped_entry not in seen:
                        seen.add(stripped_entry)
                        unique_entries.append(stripped_entry)

            # Processing: Remove unnecessary new lines within each entry.
            cleaned_entries = []
            for entry in unique_entries:
                cleaned_entry = " ".join(entry.split())
                cleaned_entries.append(cleaned_entry)

            # Processing: Remove entries containing http in them.
            cleaned_entries = [
                entry for entry in cleaned_entries if "http" not in entry
            ]

            # Processing: Remove entries if it contains the hashtag character
            cleaned_entries = [entry for entry in cleaned_entries if "#" not in entry]

            # cleaned_entries are now ready to be merged into one giant global raw_train.txt file that contains cleaned texts from everyone.
            raw_text.extend(cleaned_entries)

# export the raw_text to a file named raw_train.txt
with open(f"./raw_data_{MIN_CHAR}char.txt", "w", encoding="utf-8") as file:
    for entry in raw_text:
        file.write(entry + "\n")

print(f"Total number of tweets at our disposal: {len(raw_text)}")

# Plot the length distribution of entries
lengths = [len(entry.split()) for entry in raw_text]
lengths.sort()

import matplotlib.pyplot as plt

plt.title("Length distribution of entries")
plt.hist(lengths, bins=100)
