import csv
import re
import os
import sys

def update_csv(csv_file):
    sql_file = 'data/hospcode_202605291921.sql'
    output_file = csv_file + '.tmp'

    if not os.path.exists(csv_file):
        print(f"Error: CSV file {csv_file} not found.")
        return

    # 1. Parse SQL to build lookup
    hcode_mapping = {}
    value_pattern = re.compile(r"\((.*)\)")

    with open(sql_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('('):
                match = value_pattern.search(line)
                if match:
                    values_str = match.group(1)
                    parts = []
                    in_quote = False
                    current_part = []
                    for char in values_str:
                        if char == "'":
                            in_quote = not in_quote
                        if char == ',' and not in_quote:
                            parts.append("".join(current_part).strip().strip("'"))
                            current_part = []
                        else:
                            current_part.append(char)
                    parts.append("".join(current_part).strip().strip("'"))
                    
                    if len(parts) >= 8:
                        hcode_raw = parts[0]
                        name = parts[1]
                        province_id = parts[7]
                        
                        # Pad hcode to 5 digits, prefer numeric
                        if hcode_raw.isdigit() and len(hcode_raw) <= 5:
                            hcode = hcode_raw.zfill(5)
                            hcode_mapping[(name, province_id)] = hcode

    # 2. Update CSV
    updated_rows = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            print(f"Error: CSV file {csv_file} is empty.")
            return
            
        updated_rows.append(header)
        
        for row in reader:
            if not row: continue
            
            # Ensure row has enough columns
            if len(row) <= 6:
                updated_rows.append(row)
                continue

            province_id = row[1].strip()
            hospital_name = row[6].strip()
            
            # Update hcode if found in mapping
            if (hospital_name, province_id) in hcode_mapping:
                row[4] = hcode_mapping[(hospital_name, province_id)]
            
            # Update year to 2569
            row[5] = '2569'
            
            updated_rows.append(row)

    # 3. Write updated CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(updated_rows)

    # Replace original file
    os.replace(output_file, csv_file)
    print(f"Updated {len(updated_rows)-1} rows in {csv_file}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            update_csv(arg)
    else:
        # Default for convenience if no args provided
        update_csv('data/screening69_nm.csv')
