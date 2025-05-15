# Prometheus Documentation

This directory contains all the documentation for the Prometheus collaborative proposal tracking system.

## Documents

### Product Requirements Document (PRD)
- **File**: [Prometheus_PRD_v2.1.md](./Prometheus_PRD_v2.1.md)
- **Version**: 2.1
- **Description**: Comprehensive product requirements including user stories, key features, and business requirements
- **Key Updates in v2.1**:
  - Added AI-powered document intelligence features
  - Added automated proposal generation capabilities
  - Added content library for case studies and legal terms
  - Enhanced collaboration features
  - Cost-optimized model selection (Haiku/Titan Express → Sonnet)
  - Mandatory requirements validation before generation
  - Yoopta-Editor integration for block-based editing

### Software Requirements Specification (SRS)
- **File**: [Prometheus_SRS_v2.1.md](./Prometheus_SRS_v2.1.md)
- **Version**: 2.1
- **Description**: Technical requirements, system architecture, and implementation specifications
- **Key Updates in v2.1**:
  - Detailed functional requirements for AI document processing
  - Proposal generation module specifications
  - Content library management system
  - Enhanced API specifications
  - Cost optimization requirements and model usage restrictions
  - Pre-generation validation logic
  - Yoopta-Editor implementation specifications

### Style Guide
- **File**: [Prometheus_Style_Guide.md](./Prometheus_Style_Guide.md)
- **Version**: 1.0
- **Description**: Comprehensive design guidelines and aesthetic principles
- **Key Sections**:
  - Aesthetic guidelines with 11 core design principles
  - Color palette and usage guidelines
  - Typography system and hierarchy
  - Component library specifications
  - Animation and transition guidelines
  - Layout principles and responsive design
  - Validation checklist for feature creation

## Quick Links

### For Product Managers
- [Product Vision](./Prometheus_PRD_v2.1.md#product-vision)
- [User Stories](./Prometheus_PRD_v2.1.md#user-stories)
- [Success Metrics](./Prometheus_PRD_v2.1.md#success-metrics)

### For Developers
- [System Architecture](./Prometheus_SRS_v2.1.md#21-system-architecture)
- [API Specification](./Prometheus_SRS_v2.1.md#6-api-specification)
- [Data Model](./Prometheus_SRS_v2.1.md#5-data-model-specification)

### For Designers
- [Design & Branding Requirements](./Prometheus_PRD_v2.1.md#design--branding-requirements)
- [User Interface Requirements](./Prometheus_SRS_v2.1.md#45-user-interface-requirements)
- [Style Guide](./Prometheus_Style_Guide.md)
- [Aesthetic Guidelines](./Prometheus_Style_Guide.md#aesthetic-guidelines)
- [Validation Checklist](./Prometheus_Style_Guide.md#validation-checklist)

## Version History

### Version 2.1 (Current)
- Added AI-powered document processing using AWS Bedrock and Textract
- Integrated proposal generation with template support
- Created content library system for reusable content
- Enhanced collaboration features with real-time updates
- Implemented cost-optimized model selection strategy:
  - Always starts with Claude 3 Haiku
  - "Generate Better Version" with Claude 3 Sonnet (2x max)
  - Visual usage counter (1/2, 2/2)
  - Monthly cost limits: Warning $500, Critical/Hard $750
- Added mandatory requirements validation at question level
- Integrated Yoopta-Editor with ToC-based blocks
- Established model usage restrictions
- Added Amazon Titan Image Generator v2 (3 mockups max)
- Integrated Mermaid.js for diagram generation
- Implemented rate limiting (15 requests/5min)
- Added admin template management
- Enabled case study tracking and auto-formatting

### Version 2.0
- Initial collaboration features
- Team management and role-based access control
- Section locking mechanism
- Comments and notifications system

### Version 1.0
- Basic proposal tracking functionality
- Multi-stage workflow support
- Simple dashboard and reporting

## Additional Resources

For more information about specific features or technical details, please refer to the corresponding sections in the PRD and SRS documents.