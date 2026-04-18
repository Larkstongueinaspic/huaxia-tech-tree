import json
import time
import openai
from collections import Counter
from tqdm import tqdm

API_KEY = "sk-36e7e3720a8643c8a55a72f85801241e"
BASE_URL = "https://api.deepseek.com"
client = openai.OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)

SAVE_EVERY_N_ITEMS = 10

SYSTEM_PROMPT = """Here's the English system prompt tailored for extracting the earliest known date of a Chinese invention:

```text
You are a precise historical dating assistant specializing in the chronology of Chinese inventions. Your task is to determine the earliest recorded year an invention appeared in China based on the provided text.

【Input Content】
The user will provide:
1. The name of an invention.
2. A descriptive text about the invention (which may contain mixed international histories, vague references, or biographical data).

【Extraction Rules】
1. **China-Specific Focus**: Extract only the earliest date associated with the invention's appearance or use **within China**. Ignore dates related to foreign invention histories.
2. **Ambiguous or Missing Specific Year**:
   - If the text provides only a range or vague descriptor (e.g., "Song Dynasty" or "2nd century BC"), estimate the **earliest possible year** (e.g., "not earlier than X") and use that year.
   - If only the inventor's birth/death dates are provided, use the **year of the inventor's death** as the conservative terminus ante quem.
3. **No Year Provided**: If the text contains **no chronological information at all**, you must rely on your internal knowledge base to supply the most widely accepted earliest date for the invention in Chinese history.
4. **Date Formatting**: Output the year as an integer.
   - Use **negative numbers** for BCE dates (e.g., -104 for 104 BCE).
   - Use **positive numbers** for CE dates (e.g., 105 for 105 CE).

【Output Format】
You must return **only** a valid JSON object. Do **not** include any explanatory text, markdown formatting, or code block markers.

Example:
Input: "Papermaking is traditionally attributed to Cai Lun in the Eastern Han Dynasty."
Output: `{"name": "造纸术", "year": 105}`

Example (BCE):
Input: "The earliest Chinese bronze mirrors date back to the Qijia culture."
Output: `{"name": "铜镜", "year": -2000}`

【Additional Guidelines】
- If the text suggests the invention predates recorded history but your knowledge base indicates a specific archaeological horizon, use the earliest estimated date of that archaeological period.
- Ensure the JSON keys are exactly `name` (string) and `year` (integer).
- Do not use quotation marks inside the JSON string value for `name` unless they are properly escaped.
- If the invention name is entirely unrelated to China, return `{"name": "Error", "year": null}`.
```"""

def classify_single(reply):
    user_prompt = f"Process the following input:\n\n{reply}"

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            response_format={'type': 'json_object'},
            temperature=1.0,
            max_tokens=500
        )

        model_reply = response.choices[0].message.content.strip()

        import re
        json_match = re.search(r'\{[\s\S]*\}', model_reply)
        if json_match:
            json_str = json_match.group()
            classifications = json.loads(json_str)

        result = {
            "name": classifications.get("name", ""),
            "year": classifications.get("year", "")
        }

        return result

    except Exception as e:
        print(f"API调用失败: {e}")
        return {"name": "", "describe": "ERROR"}

def save_progress(data, output_file, suffix=""):
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"已保存进度到 {output_file}")
    return output_file

def process_replies(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    with open(output_file, 'r', encoding='utf-8') as f:
        w_target = json.load(f)
    print(f"加载了 {len(data)} 条记录")

    items_to_process = []
    items_to_process = [(p_data['name'], p_data['desc']) for p_data in data]

    for idx, (name, desc) in enumerate(tqdm(items_to_process)):
        classification = classify_single({"name": name, "desc": desc})
        for item in w_target:
            if item['name'] == classification['name']:
                item['year'] = classification['year']

        # 每N条保存一次进度
        if idx % SAVE_EVERY_N_ITEMS == 0:
            save_progress(w_target, output_file, "item")

        time.sleep(1)

    # 保存最终结果
    save_progress(w_target, output_file)

    print(f"\n最终结果已保存到 {output_file}")



if __name__ == "__main__":
    INPUT_FILE = "/Users/bo_yu/Documents/bupt/l_ds_design/huaxia-tech-tree/scripts/output/final_nodes.json"
    OUTPUT_FILE = "/Users/bo_yu/Documents/bupt/l_ds_design/huaxia-tech-tree/scripts/output/final_nodes_examined.json"

    process_replies(INPUT_FILE, OUTPUT_FILE)