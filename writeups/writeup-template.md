# Bastet Kaggle Challenge: Solution Write-up Template

> [!NOTE]
> **Note to Participants:**
> This document serves as a comprehensive template for your competition Write-up. You are not required to answer every single bullet point if it does not apply to your specific methodology. However, for the sections you do choose to include, please provide maximum detail and technical depth.

### 1. Title & Team Information

* **Authors:** [List of members]
* **Submission Link:** [Link to your Kaggle notebook or GitHub repository]



## 2. Methodology & Architecture
### 2.1 Architectural Overview
Please describe the framework design in your solution as thoroughly as possible. 

### 2.2 Vulnerability Detection Logic
* Core Detection Mechanism: 
(Describe the underlying logic your model uses to identify vulnerabilities. Does the system attempt to reconstruct program semantics, track state changes, or identify specific code patterns? Explain the conceptual framework behind your detection engine.)

* Step-by-Step Reasoning Flow: 
(Detail the specific cognitive or algorithmic steps the system takes from the moment it "reads" a function to the moment it labels a vulnerability. If you utilized techniques like multi-step prompting, self-reflection, or cross-model verification, explain the purpose and output of each stage.)

* Security Analysis Techniques: 
(Explain how your system handles complex security concepts such as user-controlled input, external call dependencies, or state-variable persistence. Describe any specific instructions or "mental models" you provided to the AI to help it understand smart contract logic.)


## 3. Key Strategies & Optimization
### 3.1 Tag & Subtag Alignment
* **Taxonomy Mapping:** (How did you ensure the LLM outputs strictly adhered to the **Bastet Tag Definitions**?)
* **Severity Scoring:** (What logic or criteria did the model use to determine High/Medium/Low impact?)

### 3.2 Maximizing Semantic Similarity (BGE-large)
* **Description Refinement:** (Strategies used to align generated descriptions with expert-labeled ground truth to boost the `bge-large-en-v1.5` cosine similarity score.)

### 3.3 Over-reporting & False Positive Mitigation
* **Filtering Logic:** (How did you handle the "Over-reporting Penalty"?)



## 4. Experimental Analysis
### 4.1 Performance & Resource Metrics
* **Inference Speed:** (Average time to scan one repository.)
* **Token Cost:** (Estimated cost per 1,000 lines of code or per repository.)
* **Model Comparison:** (If you tested multiple models, which one performed best for specific vulnerability types?)

### 4.2 What Didn't Work (The "Fail" Log)
* **Ineffective Prompts:** (Examples of prompts that led to hallucinations or low recall.)
* **Difficult Vulnerabilities:** (Which Tag/Subtag was the most challenging for your AI to identify correctly?)



## 5. Code & Reproducibility
* **Core Prompt Snippets:** (Please share the system/user prompts that yielded your best results.)
* **Environment:** (Requirements, libraries, and instructions to reproduce your scoring.)


## 6.Supplementary Materials & Research Insights
* Edge Cases: (Describe any "weird" contract behaviors or edge cases your AI struggled with.)

* Future Work: (What would you improve if you had more time or a larger compute budget?)