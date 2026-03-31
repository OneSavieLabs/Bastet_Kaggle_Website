# Baseline writeup

### 1. Title & Team Information

- **Authors:** [@fffuuumingyee](https://x.com/fffuuumingyee)

## 2. Methodology & Architecture

### 2.1 Architectural Overview

![Untitled-2026-03-26-2039.png](Baseline%20writeup/Untitled-2026-03-26-2039.png)

Bastet’s official baseline is a hybrid detection strategy, two-stage ensemble, which decomposes vulnerability detection into two complementary mechanisms:

- Static rule stage: A rule-based static engine that scan Solidity files with a small set of deterministic Python detectors, which detects known security-relevant code patterns with high precision.
- N8N workflow stage: AI-driven workflow engine that reconstructs broader contract context by bundling imports and then applies structured, vulnerability-specific reasoning workflows.

Together, the two components provide complementary coverage. Static analysis offers precision and low cost for well-known patterns, while the AI-driven workflows provide broader semantic reasoning for vulnerabilities that depend on cross-file context, protocol logic, execution paths, or state-dependent behavior.

### 2.2 Vulnerability Detection Logic

In this section, we will discuss the core detection mechanism of both stage, including the technique they use.

#### Static Analysis

The static analysis engine is implemented as a modular rule runner. Each rule is a standalone Python module under the `rules/` directory, and each module is responsible for detecting one narrow vulnerability pattern or one closely related family of patterns. This keeps the system extensible and allows new detectors to be added without changing the orchestration layer.

![Screenshot 2026-03-25 at 3.01.27 PM.png](Baseline%20writeup/Screenshot_2026-03-25_at_3.01.27_PM.png)

The static analysis engine does not attempt full symbolic execution or complete semantic reconstruction. Instead, it focuses on identifying security-relevant patterns directly from source code using two lightweight detection modes: **regex-based matching** and **AST-based analysis**.

- Regex mode: used for straightforward textual or API-level patterns,
- AST mode: leverages tree-sitter to inspect Solidity syntax structure when more precise reasoning is required.

Using the chainlink - deprecated chainlink function as an example:

```python
REGEX_MAIN = re.compile(r"\.\s*latestAnswer\s*\(\s*\)", re.MULTILINE)

def _find_findings_in_content(filepath: str, content: str) -> list[tuple[int, str]]:
    lines = content.split("\n")
    result: list[tuple[int, str]] = []

    for m in REGEX_MAIN.finditer(content):
        line_no = line_from_byte_offset(content, m.start())
        line_content = lines[line_no - 1] if 1 <= line_no <= len(lines) else ""
        result.append((line_no, line_content))

    return result
```

Using the deprecated Chainlink function rule as an example, the detector simply scans the source code for calls to `.latestAnswer()`, which is an outdate Chainlink price feed API. It uses a regular expression to match this pattern even if there are spaces around the function call. This is a typical regex-based rule: it does not analyze full program behavior, but instead looks for a specific unsafe or outdated coding pattern directly in the source text.

Overall, this design enables the static engine to efficiently and reliably detect well-defined vulnerability patterns.

#### AI-driven Automated Vulnerability Detection Process

Bastet’s automated detection pipeline combines lightweight source preprocessing with modular LLM-based auditing workflows. Rather than depending on a single general-purpose prompt, it runs a collection of specialized vulnerability detectors that can be independently enabled, disabled, and extended.

1. **SourceBundler**
    
    Before any LLM analysis runs, Bastet uses `SourceBundler` to flatten each target Solidity file together with its imported dependencies into a single bundled input. This gives the model sufficient context to understand cross-contract interactions without requiring it to resolve imports on its own. 
    In practice, the first contract in the bundle is treated as the main audit target, while imported code is provided as supporting context.
    
    For example, if there’s a contract like this:
    
    ```solidity
    pragma solidity ^0.8.19;
    
    import "./IERC20.sol";
    
    abstract contract TransferHelper {
        IERC20 public token;
    
        constructor(address _token) {
            token = IERC20(_token);
        }
    
        function _pullToken(address from, uint256 amount) internal {
            token.transferFrom(from, address(this), amount);
        }
    }
    ```
    
    Then the bundle will be like this:
    
    ```
    pragma solidity ^0.8.19;
    
    import "./IERC20.sol";
    
    abstract contract TransferHelper {
        IERC20 public token;
    
        constructor(address _token) {
            token = IERC20(_token);
        }
    
        function _pullToken(address from, uint256 amount) internal {
            token.transferFrom(from, address(this), amount);
        }
    }
    
    ====== Code imported from: path_to/IERC20.sol ======
    pragma solidity ^0.8.19;
    
    interface IERC20 {
        function transferFrom(address from, address to, uint256 amount) external returns (bool);
    }
    ```
    
2. **LLM Analysis via n8n Workflows**
    
    The bundled source is then passed to n8n-based vulnerability detection workflows. Each workflow serves as a reusable audit module focused on one vulnerability family, or a small set of closely related issues.
    
    - **Prompt**: each workflow contains expert-designed prompts that encode audit knowledge, detection rules, and reasoning instructions for a specific class of vulnerabilities.
    - **Structured Output Parser**: after the model responds, an output parser forces the result into a fixed schema (e.g., `tag, subtag, severity, description, code_snippet`). This makes the workflow output easier to validate, merge, and evaluate downstream.
    
    Example workflow: slippage min amount
    
    ![upload_146a22a341bead4c39db04ca6c490ddd.png](Baseline%20writeup/upload_146a22a341bead4c39db04ca6c490ddd.png)
    
3. **Techniques Used in the Workflows**
    
    Bastet’s workflows do more than simple prompting. They incorporate several techniques and reasoning patterns to improve precision:
    
    - **Chain-of-Thought (CoT)**:
        
        many workflows guide the model through an explicit step-by-step reasoning process instead of requesting for a direct answer. This helps the model check preconditions, interpret contract context, and justify why an issue should or should not be reported.
        
        ![upload_9057db7a3f9aab7a74dbb1d68f6a4cc2.png](Baseline%20writeup/upload_9057db7a3f9aab7a74dbb1d68f6a4cc2.png)
        
    - **Code-block preprocessing**:
        
        some workflows use n8n code nodes before the LLM step to clean, split, or filter the input so the model only sees the most relevant context. The Pause workflow is a good example: it first uses code blocks to split the bundled source into base contract vs imported contracts, then applies lightweight checks such as **direct Pausable inheritance** or **pause-related keyword filtering** before invoking the LLM. This reduces unnecessary LLM work and helps narrow the model’s attention to the more specific patterns and the contracts that are more likely to contain pause-related issues.
        
        ![Screenshot 2026-03-26 at 5.03.24 PM.png](Baseline%20writeup/Screenshot_2026-03-26_at_5.03.24_PM.png)
        
    - **Multi-stage with self-reflection/validation**:
        
        Some vulnerability classes are too complex to handle reliably in a single prompt. In these cases, workflows split detection into multiple focused stages instead of asking the model to complete the entire reasoning chain at once. This reduces task complexity at each stage, improves focus, and makes the workflow easier to debug. 
        
        In addition, we find that even some workflows include a final verification stage that reviews earlier findings before returning them. The Slippage workflow is the representative example: it first identifies candidate functions, then checks whether slippage protection is actually missing or ineffective, and finally validates the findings to filter weaker or incorrect reports.
        
        Example workflow: Slippage
        
        ![Screenshot 2026-03-26 at 5.01.55 PM.png](Baseline%20writeup/Screenshot_2026-03-26_at_5.01.55_PM.png)
        
        self-reflection/validation prompt:
        
        ```
        ## Task to perform
        
        Given the contract and the reports, judge if each report is valid.
        
        Judgement rules:
        - Check whether the reported function really needs slippage protection.
        - Functions that are inside interface and have no implementation should not be reported.
        - If the slippage parameter is user-controllable, do not report it as hardcoded or minOut set to 0.
        - If a report is fully valid, keep it.
        - If a report is partially invalid, keep only the valid portion and remove the invalid portion.
        - If a report is invalid, remove it.
        - If there is no original report, final_report should be an empty array.
        ```
        

---

## 3. Key Strategies & Optimization

### 3.1 Tag / Subtag / severity / description Alignment

- In the static analysis, the tag, subtag, severity, and description are predefined in each rule. This is because the targeted vulnerabilities are usually well known, narrowly defined, and have a clear root cause and security impact.
- In the AI-driven Automated Vulnerability Detection Process, the definitions of tag and subtag are provided to the LLM as part of the prompt. The model then determines the most suitable tag/subtag, assigns a severity based on the vulnerability context, and generates a corresponding description.

### 3.2 **Excluding Out-of-Scope Contracts**

We use `EXCLUDE_DIRS` as a case-insensitive directory-pruning mechanism during source discovery. Directories such as `test/`, `scripts/`, `deploy/`, `interfaces/`, `mocks/`, and common third-party library folders are excluded before analysis begins, so contracts in those locations are not scanned as top-level targets by either the static engine or the LLM pipeline. Users can also extend or update `EXCLUDE_DIRS` to match the scope of a specific assessment. This helps reduce noise, avoids spending analysis effort on irrelevant code, and keeps findings aligned with the intended audit scope.

### 3.3 Over-reporting & False Positive Mitigation

In real audits, auditors do **not** write one finding per line of code, one finding per function, or one finding per contract. Instead, they try to identify the **underlying bug pattern** and then consolidate all manifestations of that pattern into a single issue.

Our baseline tries to mimic this behavior by two way:

1. **Static-rule aggregation**: After the static rules finish scanning all in-scope Solidity files, the raw hits are grouped by **`(repo_path, tag, subtag, severity)`** before report generation. In other words, repeated matches of the same vulnerability class inside the same repository are collapsed into a single row, rather than being emitted once per code location.
2. **LLM finding deduplication:** The LLM pipeline applies an additional deduplication pass after parsing each workflow output into the AuditReportV2 schema. Concretely, it builds a vulnerability key from **tag + subtag** and retains only the first accepted finding for that key. This means that if multiple active workflows, or multiple scanned contracts, produce findings with the same tag/subtag pair, later ones are dropped. This is an aggressive over-reporting control: it reduces repeated reporting of the same high-level issue category, but it can also merge distinct manifestations that happen to share the same taxonomy labels.

This is an aggressive over-reporting control because the deduplication key does not include code snippet, contract path, or any other location-level evidence. As a result, the system tends to produce fewer reports by collapsing findings that share the same high-level taxonomy labels, even when they refer to different code sites. This does reduce duplicate reporting, but it also introduces several risks:

1. It can hide false positives in a misleading way: a false positive may disappear not because it was correctly rejected, but simply because it collided with another finding under the same key.
2. It can hide true positives as well. Since the current implementation keeps only the first finding encountered for a given key, an earlier but less accurate report can suppress a later and more precise one.
3. This makes evaluation harder to interpret. A lower number of final reports may indicate better consolidation, but it may also reflect accidental suppression of meaningful findings rather than genuine improvement in precision.

## 4. Experimental Analysis

### Setup

- 4 static rules:
    - call/delegatecall - missing return check
    - chainlink - deprecated chainlink function
    - dos - deprecated transfer
    - solmate - missing return check
- 7 n8n workflows:
    - Liquidation
    - DoS
    - eip-712
    - Reentrancy
    - flashloan
    - slippage
    - pause

### Experiment result

- **Inference Speed:** 15.4 min per repository
- **Cost:** $5 per repository

### Detailed Results & Analysis

For a deeper dive into the specific workflow design, performance characteristics, and detailed analysis, please refer to [this article](https://www.notion.so/Slippage-experiment-325ff4621bc280ba83b9c9e27a6146e2?pvs=21).