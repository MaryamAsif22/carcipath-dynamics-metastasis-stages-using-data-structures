
def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    #rpn  
    stack = []
    
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char in '({[':
                stack.append((char, i + 1, j + 1))
            elif char in ')}]':
                if not stack:
                    print(f"Unbalanced '{char}' at {i+1}:{j+1}")
                    return
                last = stack.pop()
                expected = {'(': ')', '{': '}', '[': ']'}[last[0]]
                if char != expected:
                    print(f"Mismatch at {i+1}:{j+1}. Found '{char}'. Expected '{expected}' (Opened at {last[1]}:{last[2]})")
                    return
    
    if stack:
        last = stack[0]
        print(f"Unclosed '{last[0]}' started at {last[1]}:{last[2]}")
    else:
        print("OK")

check_balance('d:\\carcipath dynamics ds\\app.js')
