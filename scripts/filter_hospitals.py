import re

input_file = 'data/hospitals_202606151633.sql'
output_file = 'data/hospitals_filtered_202606151633.sql'
target_provinces = {'30', '31', '32', '36'}

insert_header = "INSERT INTO elderly_db.hospitals (hcode,name,hospital_type_id,address,moo,subdistrict_id,district_id,province_id,region_id,phone) VALUES\n"

with open(input_file, 'r', encoding='utf-8') as f, open(output_file, 'w', encoding='utf-8') as out:
    current_insert_header = None
    for line in f:
        line = line.strip()
        if line.startswith('INSERT INTO'):
            current_insert_header = line
            continue
        
        if line.startswith('('):
            # Try to extract the province_id. 
            # It's the 8th value. 
            # We can use regex to find values inside parentheses.
            # A simple split by comma might work if we are careful about strings, 
            # but since province_id is numeric and preceded by numeric district_id, 
            # it's usually safe to look at the 8th element.
            
            # Remove trailing comma or semicolon
            clean_line = line.rstrip(',;')
            # Extract values inside the first ( and last )
            match = re.search(r'\((.*)\)', clean_line)
            if match:
                values_str = match.group(1)
                # Split by comma, but respect single quotes
                # Using a simple regex to split by comma not followed by space inside quotes is hard.
                # However, looking at the data, the numeric values are not quoted.
                # province_id is at index 7 (0-indexed)
                parts = []
                in_quote = False
                current_part = []
                for char in values_str:
                    if char == "'":
                        in_quote = not in_quote
                    if char == ',' and not in_quote:
                        parts.append("".join(current_part).strip())
                        current_part = []
                    else:
                        current_part.append(char)
                parts.append("".join(current_part).strip())
                
                if len(parts) >= 8:
                    province_id = parts[7]
                    if province_id in target_provinces:
                        # Write the header if we haven't already for this batch, or just write a simple one.
                        # The user asked to "copy SQL command", which might imply keeping the structure.
                        # I'll write each matching line as a separate INSERT to be safe and simple.
                        out.write(insert_header)
                        out.write(f"\t {line.rstrip(',;')};\n")

print(f"Filtering complete. Output saved to {output_file}")
