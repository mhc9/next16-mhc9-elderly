import csv
import re
import os
import sys

# Configuration
MASTER_SQL_FILE = 'data/hospcode_202605291921.sql'

def normalize_name(name):
    """Collapses multiple whitespaces into a single space and strips quotes."""
    if not name:
        return ""
    name = name.strip().strip("'")
    return re.sub(r'\s+', ' ', name)

def get_lookup_table(sql_file_path):
    """Parses SQL file to create a mapping of (normalized_name, province_id) -> 5-digit hcode."""
    # Pattern to capture everything inside ( )
    value_pattern = re.compile(r"\((.*?)\)")
    lookup = {}
    
    print(f"Loading master data from {sql_file_path}...")
    try:
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip().startswith("('") and not line.strip().startswith("INSERT INTO"):
                    continue
                
                matches = value_pattern.findall(line)
                for match in matches:
                    parts = [p.strip() for p in match.split(',')]
                    if len(parts) >= 8:
                        hcode = parts[0].strip("'")
                        
                        # VALIDATION: Only accept exactly 5 numeric digits
                        if not re.match(r'^\d{5}$', hcode):
                            continue
                            
                        name = normalize_name(parts[1])
                        prov_id = parts[7].strip("'")
                        
                        lookup[(name, prov_id)] = hcode
                        
        print(f"Found {len(lookup)} unique 5-digit hospital mappings.")
        return lookup
    except Exception as e:
        print(f"Error reading SQL file: {e}")
        return None

def update_csv_file(csv_file_path, lookup, output_path=None):
    """Updates the hcode column and adds a year column to the given CSV file."""
    if not os.path.exists(csv_file_path):
        print(f"CSV file not found: {csv_file_path}")
        return

    if output_path is None:
        output_path = csv_file_path

    updated_rows = []
    matched_count = 0
    overwritten_count = 0
    unmatched = set()

    print(f"Processing {csv_file_path}...")
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            lines = [line for line in f if line.strip() and not line.strip().replace(',', '') == '']
            reader = csv.DictReader(lines)
            
            fieldnames = list(reader.fieldnames)
            if 'year' not in fieldnames:
                try:
                    idx = fieldnames.index('hcode') + 1
                    fieldnames.insert(idx, 'year')
                except ValueError:
                    fieldnames.append('year')
            
            for row in reader:
                hospital_name = row.get('hospital name', '').strip()
                prov_id = row.get('province_id', '').strip()
                current_hcode = row.get('hcode', '').strip()
                
                row['year'] = '2569'
                
                if hospital_name:
                    norm_name = normalize_name(hospital_name)
                    key = (norm_name, prov_id)
                    
                    if key in lookup:
                        new_hcode = lookup[key]
                        if not current_hcode:
                            matched_count += 1
                        elif current_hcode != new_hcode:
                            overwritten_count += 1
                        row['hcode'] = new_hcode
                    else:
                        unmatched.add((hospital_name, prov_id))
                
                updated_rows.append(row)

        with open(output_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(updated_rows)

        print(f"  - Successfully wrote to {output_path}")
        print(f"  - Total rows: {len(updated_rows)}")
        print(f"  - Rows newly matched: {matched_count}")
        print(f"  - Rows corrected: {overwritten_count}")
        if unmatched:
            print(f"  - Failed to match {len(unmatched)} unique hospital names.")
            
    except Exception as e:
        print(f"Error processing CSV: {e}")

if __name__ == "__main__":
    lookup = get_lookup_table(MASTER_SQL_FILE)
    if not lookup:
        sys.exit(1)

    target_file = sys.argv[1] if len(sys.argv) > 1 else 'data/screening69_nakhonratchasina.csv'
    output_file = sys.argv[2] if len(sys.argv) > 2 else target_file
    update_csv_file(target_file, lookup, output_file)
