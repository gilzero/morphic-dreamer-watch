/**
 * @fileoverview This file defines the ModelSelector component,
 * which allows users to select a model from a list of available
 * models, grouped by provider.
 * @filepath components/model-selector.tsx
 */
'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from './ui/select'
import Image from 'next/image'
import { Model, models } from '@/lib/types/models'
import { createModelId } from '@/lib/utils'

/**
 * Defines the props for the ModelSelector component.
 */
interface ModelSelectorProps {
  /** The currently selected model ID. */
  selectedModelId: string
  /** Callback function to handle model selection changes. */
  onModelChange: (id: string) => void
}

/**
 * Groups an array of models by their provider.
 * @param {Model[]} models - The array of models to group.
 * @returns {Record<string, Model[]>} An object where keys are
 * providers and values are arrays of models for that provider.
 */
function groupModelsByProvider(models: Model[]) {
  return models.reduce((groups, model) => {
    const provider = model.provider
    if (!groups[provider]) {
      groups[provider] = []
    }
    groups[provider].push(model)
    return groups
  }, {} as Record<string, Model[]>)
}

/**
 * A component that renders a dropdown to select a model.
 * @param {ModelSelectorProps} props - The props for the
 * ModelSelector component.
 * @returns {JSX.Element} A JSX element representing the model
 * selector dropdown.
 */
export function ModelSelector({
  selectedModelId,
  onModelChange
}: ModelSelectorProps) {
  /**
   * Handles the change of the selected model.
   * @param {string} id - The ID of the selected model.
   */
  const handleModelChange = (id: string) => {
    onModelChange(id)
  }

  const groupedModels = groupModelsByProvider(models)

  return (
    <div className="absolute -top-8 left-2">
      <Select
        name="model"
        value={selectedModelId}
        onValueChange={handleModelChange}
      >
        <SelectTrigger className="mr-2 h-7 text-xs border-none shadow-none focus:ring-0">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {Object.entries(groupedModels).map(([provider, models]) => (
            <SelectGroup key={provider}>
              <SelectLabel className="text-xs sticky top-0 bg-background z-10">
                {provider}
              </SelectLabel>
              {models.map(model => (
                <SelectItem
                  key={createModelId(model)}
                  value={createModelId(model)}
                  className="py-2"
                >
                  <div className="flex items-center space-x-1">
                    <Image
                      src={`/providers/logos/${model.providerId}.svg`}
                      alt={model.provider}
                      width={18}
                      height={18}
                      className="bg-white rounded-full border"
                    />
                    <span className="text-xs font-medium">{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
