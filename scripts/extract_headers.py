import pandas as pd
import json
import sys

file_path = "data/แบบรายงานการคัดกรองและดูแลช่วยเหลือผู้สูงอายุกลุ่มเสี่ยง.xlsx"
output_path = "data/schema_info.json"

try:
    xl = pd.ExcelFile(file_path)
    info = {
        "sheets": xl.sheet_names,
        "data": {}
    }
    
    for sheet_name in xl.sheet_names:
        # Read first 5 rows to understand the header structure (Excel files often have merged cells/multi-row headers)
        df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=5)
        
        info["data"][sheet_name] = {
            "columns": df.columns.tolist(),
            "sample_rows": df.fillna("").values.tolist()
        }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False, indent=4)
    
    print(f"Extraction successful. Data saved to {output_path}")

except Exception as e:
    print(f"Error: {e}")
