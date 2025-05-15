# Proposal Generation Implementation Guide

## Overview
This guide provides technical implementation details for the cost-optimized proposal generation feature with Yoopta-Editor integration.

## Model Selection Strategy

### Cost Optimization Tiers

1. **Tier 1: Initial Generation (Always Default)**
   - Model: Claude 3 Haiku
   - Cost: ~$0.25 per generation
   - Use case: First draft, all initial generations
   - Performance: 30-45 seconds
   - Active voice generation by default

2. **Tier 2: Quality Enhancement (User-Triggered)**
   - Model: Claude 3 Sonnet
   - Cost: ~$1.50-2.00 per generation
   - Use case: "Generate Better Version" button
   - Performance: 60-90 seconds
   - Restrictions:
     - Maximum 2 generations per proposal
     - Visual counter (1/2, 2/2)
     - Second generation requires >5% semantic similarity change

3. **Image Generation**
   - Model: Amazon Titan Image Generator v2
   - Cost: ~$0.08 per image
   - Limit: 3 mockup images per proposal
   - Resolution: 1024×1024
   - Auto-included in proposals

4. **Monthly Cost Limits**
   - Warning alert: $500/month
   - Critical alert: $750/month
   - Hard limit: $750/month (Haiku only, no images)

### Implementation

```javascript
// services/proposalGenerationService.js
class ProposalGenerationService {
  constructor() {
    this.models = {
      'haiku': 'anthropic.claude-3-haiku-20240307-v1:0',
      'sonnet': 'anthropic.claude-3-sonnet-20240229-v1:0',
      'titan-image': 'amazon.titan-image-generator-v2:0'
    };
    
    this.costPerModel = {
      'haiku': 0.25,
      'sonnet': 2.00,
      'titan-image': 0.08
    };
    
    this.monthlyLimits = {
      warning: 500,
      critical: 750,
      hard: 750
    };
  }

  async generateProposal(proposalId, modelTier = 'base') {
    // Check monthly usage limit
    const monthlyUsage = await this.getMonthlyUsage();
    if (monthlyUsage >= this.monthlyLimits.hard && modelTier !== 'base') {
      throw new Error('Monthly usage limit reached. Only base model available.');
    }
    
    // Check generation count for Sonnet
    if (modelTier === 'better') {
      const canUseSonnet = await this.validateSonnetUsage(proposalId);
      if (!canUseSonnet) {
        throw new Error('Sonnet usage limit exceeded (2/2)');
      }
    }
    
    // Validate mandatory requirements at question level
    const validationResult = await this.validateRequirements(proposalId);
    if (!validationResult.isValid) {
      throw new Error(`Missing mandatory fields: ${validationResult.missingFields.join(', ')}`);
    }
    
    // Always use Haiku for base, Sonnet for better
    const model = modelTier === 'better' ? 'sonnet' : 'haiku';
    
    // Generate proposal with active voice
    const result = await this.invokeModel(model, proposalId, { voice: 'active' });
    
    // Generate mockup images if not at limit
    if (monthlyUsage < this.monthlyLimits.hard) {
      await this.generateMockupImages(proposalId);
    }
    
    // Generate diagrams
    await this.generateDiagrams(proposalId);
    
    // Log usage and check alerts
    await this.logModelUsage(proposalId, model);
    await this.checkCostAlerts(monthlyUsage);
    
    return result;
  }

  async validateSonnetUsage(proposalId) {
    const usage = await this.getModelUsage(proposalId, 'sonnet');
    
    if (usage.count >= 2) {
      return false;
    }
    
    if (usage.count === 1) {
      // Check for >5% input change
      const changePercentage = await this.calculateInputChange(proposalId);
      return changePercentage > 0.05;
    }
    
    return true;
  }

  async validateRequirements(proposalId) {
    const proposal = await this.getProposal(proposalId);
    const template = await this.getTemplate(proposal.type || 'software-development');
    const mandatoryFields = template.mandatoryFields;
    const missingFields = [];
    
    // Validate at question level
    for (const question of mandatoryFields) {
      const value = proposal.answers[question.id];
      if (!value || value.trim() === '') {
        missingFields.push(question.label);
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
  
  async generateMockupImages(proposalId) {
    const proposal = await this.getProposal(proposalId);
    const existingImages = await this.getProposalImages(proposalId);
    
    if (existingImages.length >= 3) {
      return; // Already at limit
    }
    
    const imagesToGenerate = Math.min(3 - existingImages.length, 3);
    const images = [];
    
    for (let i = 0; i < imagesToGenerate; i++) {
      const prompt = this.generateImagePrompt(proposal, i);
      const image = await this.titanImageGenerator.generate({
        prompt,
        width: 1024,
        height: 1024,
        numberOfImages: 1
      });
      
      const imageId = this.generateId();
      await this.saveImage(proposalId, imageId, image);
      images.push({ id: imageId, url: image.url });
    }
    
    return images;
  }
  
  async generateDiagrams(proposalId) {
    const proposal = await this.getProposal(proposalId);
    const diagramTypes = [
      'sequence',
      'deployment',
      'system-architecture',
      'process-flow',
      'business-process'
    ];
    
    const diagrams = [];
    
    for (const type of diagramTypes) {
      if (this.shouldGenerateDiagram(proposal, type)) {
        const mermaidCode = await this.generateMermaidDiagram(proposal, type);
        const diagramId = this.generateId();
        
        await this.saveDiagram(proposalId, diagramId, {
          type,
          mermaidCode,
          svg: await this.renderMermaid(mermaidCode)
        });
        
        diagrams.push({ id: diagramId, type });
      }
    }
    
    return diagrams;
  }
}
```

## Yoopta-Editor Integration

### Installation

```bash
npm install @yoopta/editor @yoopta/exports
```

### Component Implementation

```javascript
// components/ProposalEditor/ProposalEditor.js
import React, { useState, useRef } from 'react';
import YooptaEditor, { createYooptaEditor } from '@yoopta/editor';
import { Bold, Italic, Link, Strike } from '@yoopta/editor/tools';
import { Paragraph, Heading, List, Quote, Code, Image } from '@yoopta/editor/blocks';
import { Save, Undo, Redo } from 'lucide-react';

const ProposalEditor = ({ proposalId, initialContent, onSave }) => {
  const editor = useRef(createYooptaEditor()).current;
  const [isSaving, setIsSaving] = useState(false);
  
  const plugins = [
    Paragraph,
    Heading.extend({
      options: {
        levels: [1, 2, 3]
      }
    }),
    List.extend({
      options: {
        types: ['bullet', 'numbered']
      }
    }),
    Quote,
    Code,
    Image
  ];
  
  const tools = {
    toolbar: {
      items: [Bold, Italic, Strike, Link]
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    const content = editor.getContent();
    await onSave(proposalId, content);
    setIsSaving(false);
  };

  return (
    <div className="proposal-editor">
      <div className="editor-toolbar">
        <button onClick={() => editor.history.undo()}>
          <Undo size={20} />
        </button>
        <button onClick={() => editor.history.redo()}>
          <Redo size={20} />
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="ml-auto"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={tools}
        placeholder="Start writing your proposal..."
        value={initialContent}
        className="min-h-[600px] max-w-4xl mx-auto p-8"
      />
    </div>
  );
};

export default ProposalEditor;
```

### Custom Blocks for Proposals

```javascript
// components/ProposalEditor/blocks/CaseStudyBlock.js
import { createBlock } from '@yoopta/editor';

const CaseStudyBlock = createBlock({
  name: 'case-study',
  displayName: 'Case Study',
  defaultValue: {
    title: '',
    client: '',
    industry: '',
    summary: '',
    outcomes: []
  },
  render: ({ data, updateData }) => {
    return (
      <div className="case-study-block p-4 border rounded">
        <input
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Case Study Title"
          className="text-lg font-semibold mb-2"
        />
        <input
          value={data.client}
          onChange={(e) => updateData({ client: e.target.value })}
          placeholder="Client Name"
          className="text-md mb-2"
        />
        <textarea
          value={data.summary}
          onChange={(e) => updateData({ summary: e.target.value })}
          placeholder="Summary"
          className="w-full mb-2"
        />
      </div>
    );
  }
});
```

## Pre-Generation Validation

```javascript
// components/ProposalGeneration/GenerationValidator.js
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const GenerationValidator = ({ proposal, requirements }) => {
  const validateRequirements = () => {
    const validation = {
      passed: [],
      failed: []
    };
    
    requirements.forEach(req => {
      const value = proposal[req.field];
      const isValid = req.validator ? req.validator(value) : !!value;
      
      if (isValid) {
        validation.passed.push(req);
      } else {
        validation.failed.push(req);
      }
    });
    
    return validation;
  };
  
  const validation = validateRequirements();
  const canGenerate = validation.failed.length === 0;
  
  return (
    <div className="validation-panel p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-semibold mb-3">
        Pre-Generation Requirements
      </h3>
      
      <div className="requirements-list">
        {requirements.map(req => {
          const isPassed = validation.passed.includes(req);
          return (
            <div 
              key={req.field}
              className={`requirement-item flex items-center p-2 mb-2 rounded ${
                isPassed ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              {isPassed ? (
                <CheckCircle className="text-green-600 mr-2" size={20} />
              ) : (
                <AlertCircle className="text-red-600 mr-2" size={20} />
              )}
              <span className={isPassed ? 'text-green-800' : 'text-red-800'}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {!canGenerate && (
        <div className="mt-4 p-3 bg-yellow-50 rounded">
          <p className="text-yellow-800 text-sm">
            All requirements must be met before generating a proposal.
          </p>
        </div>
      )}
    </div>
  );
};

// Usage
const requirements = [
  {
    field: 'customerName',
    label: 'Customer Name',
    validator: (value) => value && value.length > 2
  },
  {
    field: 'projectScope',
    label: 'Project Scope',
    validator: (value) => value && value.length > 50
  },
  {
    field: 'budget',
    label: 'Budget Range',
    validator: (value) => value && value > 0
  },
  {
    field: 'timeline',
    label: 'Project Timeline',
    validator: (value) => value && value.weeks > 0
  }
];
```

## Cost Tracking and Display

```javascript
// components/ProposalGeneration/CostTracker.js
import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

const CostTracker = ({ proposalId, modelUsage }) => {
  const calculateCosts = () => {
    let total = 0;
    const breakdown = [];
    
    modelUsage.forEach(usage => {
      const cost = usage.model === 'sonnet' ? 2.00 : 0.35;
      total += cost;
      breakdown.push({
        model: usage.model,
        timestamp: usage.timestamp,
        cost: cost
      });
    });
    
    return { total, breakdown };
  };
  
  const { total, breakdown } = calculateCosts();
  
  return (
    <div className="cost-tracker p-4 bg-blue-50 rounded">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Generation Costs</h3>
        <div className="flex items-center">
          <DollarSign size={20} className="text-blue-600 mr-1" />
          <span className="text-xl font-bold text-blue-800">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
      
      <div className="breakdown text-sm">
        {breakdown.map((item, index) => (
          <div key={index} className="flex justify-between py-1">
            <span className="text-gray-600">
              {item.model === 'sonnet' ? 'Claude 3 Sonnet' : 'Base Model'}
            </span>
            <span className="text-gray-800">${item.cost.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      {modelUsage.filter(u => u.model === 'sonnet').length === 2 && (
        <div className="mt-3 p-2 bg-yellow-100 rounded">
          <p className="text-yellow-800 text-sm">
            Sonnet usage limit reached for this proposal.
          </p>
        </div>
      )}
    </div>
  );
};
```

## Configuration File

```javascript
// config/proposalGeneration.js
export const proposalGenerationConfig = {
  models: {
    costOptimized: [
      {
        id: 'haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        cost: 0.25,
        performance: '30-45 seconds'
      },
      {
        id: 'titan',
        name: 'Amazon Titan Express',
        provider: 'amazon',
        modelId: 'amazon.titan-text-express-v1',
        cost: 0.35,
        performance: '35-50 seconds'
      }
    ],
    qualityOptimized: {
      id: 'sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      cost: 2.00,
      performance: '60-90 seconds',
      restrictions: {
        maxGenerations: 2,
        minInputChangePercent: 0.05
      }
    }
  },
  mandatoryFields: {
    rfp: ['customerName', 'projectScope', 'requirements', 'timeline', 'budget'],
    custom: ['customerName', 'objectives', 'deliverables', 'timeline'],
    consulting: ['customerName', 'challenges', 'approach', 'outcomes', 'timeline']
  },
  yooptaConfig: {
    maxContentSize: 10 * 1024 * 1024, // 10MB
    autosaveInterval: 30000, // 30 seconds
    collaborationEnabled: true,
    versionHistoryEnabled: true
  }
};
```

## Database Schema Updates

```javascript
// Additional DynamoDB entities for tracking
const generationLogEntity = {
  PK: 'PROPOSAL#proposalId',
  SK: 'GENERATION#timestamp',
  model: 'haiku|titan|sonnet',
  cost: 0.25,
  inputHash: 'sha256_of_input',
  outputSize: 12500,
  duration: 45,
  userId: 'user123',
  success: true,
  error: null
};

const modelUsageEntity = {
  PK: 'USER#userId',
  SK: 'MODEL_USAGE#proposalId#timestamp',
  model: 'sonnet',
  count: 1,
  totalCost: 2.00,
  inputChangePercent: 0.08
};
```

This implementation ensures:
1. Cost optimization through tiered model selection
2. Strict enforcement of Sonnet usage limits
3. Validation of mandatory requirements before generation
4. Rich text editing with Yoopta-Editor
5. Real-time cost tracking and display
6. Comprehensive logging for analytics