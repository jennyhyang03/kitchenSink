import os
import json
from app.services.vision import identify_food
from openai import OpenAI

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LABELS_PATH = os.path.join(BASE_DIR, "labels.txt")
IMAGE_DIR = os.path.join(BASE_DIR, "images")

with open(LABELS_PATH, "r") as f:
    GROUND_TRUTH = json.load(f)

client = OpenAI()

def jaccard(truth, pred):
    truth = set(truth)
    pred = set(pred)

    if len(truth | pred) == 0:
        return 1.0

    return len(truth & pred) / len(truth | pred)

def normalize(x):
    x = x.lower().strip()

    if x.endswith("s") and not x.endswith("ss"):
        x = x[:-1]

    return x

def calc_via_llm(truth, pred):
    prompt = f"""
    You are evaluating ingredient detection accuracy.
    
    Return ONLY a number between 0 and 1.
    
    Rules:
    - Ignore plural/singular differences
    - Ignore minor wording differences
    - Focus on whether the same food items are present
    
    Ground Truth:
    {truth}
    
    Prediction:
    {pred}
    """

    response = client.responses.create(
        model="gpt-5.1",
        temperature=0,
        input=prompt
    )

    text = response.output_text.strip()

    try:
        return float(text)
    except:
        import re
        match = re.search(r"\d+(\.\d+)?", text)
        return float(match.group()) if match else 0.0

def main():
    jaccard_scores = []
    llm_scores = []

    results_file = os.path.join(BASE_DIR, "evaluation_results.txt")

    with open(results_file, "w") as out:
        out.write("FRIDGE EVALUATION RESULTS\n")
        out.write("=========================\n\n")

        for fridge_id, truth_items in GROUND_TRUTH.items():

            image_path = os.path.join(IMAGE_DIR, f"{fridge_id}.jpg")

            if not os.path.exists(image_path):
                print(f"Missing image: {image_path}")
                continue

            
            result = identify_food(image_path)

            if isinstance(result, dict):
                pred_items = result.get("ingredients", [])
            else:
                pred_items = result

            
            raw_truth = truth_items
            raw_pred = pred_items

            norm_truth = [normalize(x) for x in truth_items]
            norm_pred = [normalize(x) for x in pred_items]

           
            j_score = jaccard(norm_truth, norm_pred)
            llm_score = calc_via_llm(raw_truth, raw_pred)

            jaccard_scores.append(j_score)
            llm_scores.append(llm_score)

        
            out.write(f"{fridge_id}\n")
            out.write(f"Ground Truth: {raw_truth}\n")
            out.write(f"Prediction  : {raw_pred}\n")
            out.write(f"Jaccard     : {j_score:.3f}\n")
            out.write(f"LLM Score   : {llm_score:.3f}\n")
            out.write("\n----------------------\n\n")

            print(f"{fridge_id}: J={j_score:.3f}, LLM={llm_score:.3f}")

    
        avg_j = sum(jaccard_scores) / len(jaccard_scores)
        avg_l = sum(llm_scores) / len(llm_scores)

        out.write("\n====================\n")
        out.write(f"AVG JACCARD: {avg_j:.3f}\n")
        out.write(f"AVG LLM    : {avg_l:.3f}\n")
        out.write("====================\n")

    print("\n====================")
    print(f"AVG JACCARD: {avg_j:.3f}")
    print(f"AVG LLM    : {avg_l:.3f}")
    print("====================")


if __name__ == "__main__":
    main()
