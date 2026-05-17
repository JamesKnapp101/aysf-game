# Project Guidance

Follow the architecture and content guidelines in this project.

## Architecture Goals
Keep content rich, but keep special cases local.

## Zone Structure
Use a folder once a zone has multiple custom systems.

## Item Interactions
Prefer item overrides for single-item behavior.

## Cross-Cutting Behavior
Use registries/hooks instead of importing specific zone logic into engine files.

## Import Direction
Generic systems should not accumulate world-specific imports.

## Testing
Add focused zone tests for every meaningful puzzle or stateful interaction.

## Content Density
Only add custom responses where they create signal: progress, reward, danger, clue, joke, or texture.