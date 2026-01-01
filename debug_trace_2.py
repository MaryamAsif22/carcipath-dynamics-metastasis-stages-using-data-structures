
def trace_last_closure(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    
    last_closure_info = "None"

    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char in '({[':
                stack.append((char, i + 1, j + 1))
            elif char in ')}]':
                if not stack: continue
                last = stack.pop()
                # If this is line 913 and char is '}'
                if i+1 == 914 and char == '}':
                    print(f"Brace at 914 closed {last[0]} from {last[1]}:{last[2]}")
                    return

trace_last_closure('d:\\carcipath dynamics ds\\app.js')
