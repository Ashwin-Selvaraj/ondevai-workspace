'use client';
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { MLCEngine } from '@mlc-ai/web-llm';
import { initWebLLM, type EngineState } from './webllm';
import { DEFAULT_MODEL, type ModelDef } from './models';

interface EngineContextType extends EngineState {
  selectedModel: ModelDef;
  loadModel: (model: ModelDef) => Promise<void>;
  setModel: (model: ModelDef) => void;
}

const EngineContext = createContext<EngineContextType | null>(null);

type Action =
  | { type: 'SET_STATE'; payload: Partial<EngineState> }
  | { type: 'SET_MODEL'; payload: ModelDef };

function reducer(
  state: EngineContextType,
  action: Action
): EngineContextType {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };
    default:
      return state;
  }
}

const initialState: EngineContextType = {
  engine: null,
  isReady: false,
  isLoading: false,
  progress: 0,
  progressText: 'Ready to load model',
  currentModelId: '',
  error: null,
  selectedModel: DEFAULT_MODEL,
  loadModel: async () => {},
  setModel: () => {},
};

export function EngineProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadModel = useCallback(async (model: ModelDef) => {
    dispatch({ type: 'SET_MODEL', payload: model });
    const engine = await initWebLLM(model.id, (partial) => {
      dispatch({ type: 'SET_STATE', payload: { ...partial, engine: null } });
    });
    dispatch({
      type: 'SET_STATE',
      payload: {
        engine,
        isReady: true,
        isLoading: false,
        currentModelId: model.id,
      },
    });
  }, []);

  const setModel = useCallback((model: ModelDef) => {
    dispatch({ type: 'SET_MODEL', payload: model });
  }, []);

  return (
    <EngineContext.Provider value={{ ...state, loadModel, setModel }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngine(): EngineContextType {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngine must be inside EngineProvider');
  return ctx;
}
