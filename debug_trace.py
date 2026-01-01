
def trace_closures(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char in '({[':
                stack.append((char, i + 1, j + 1))
            elif char in ')}]':
                if not stack: continue
                last = stack.pop()
                # If we are near the end, log it
                if i > 900:
                    print(f"Line {i+1}: '{char}' closed '{last[0]}' from {last[1]}:{last[2]}")

trace_closures('d:\\carcipath dynamics ds\\app.js')
