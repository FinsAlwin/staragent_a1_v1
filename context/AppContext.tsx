import React, { createContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import { type AppState, type AppAction, type AppContextType, type ExtractionField, type Tag, type User } from '../types'; // Updated import path
import { DEFAULT_EXTRACTION_FIELDS, DEFAULT_TAGS } from '../constants'; // Updated import path

const initialState: AppState = {
  currentUser: null,
  extractionFields: [],
  tags: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('currentUser', JSON.stringify(action.payload));
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      localStorage.removeItem('currentUser');
      return { ...state, currentUser: null };
    case 'SET_EXTRACTION_FIELDS':
      return { ...state, extractionFields: action.payload };
    case 'ADD_EXTRACTION_FIELD':
      {
        const newFields = [...state.extractionFields, action.payload];
        localStorage.setItem('extractionFields', JSON.stringify(newFields));
        return { ...state, extractionFields: newFields };
      }
    case 'UPDATE_EXTRACTION_FIELD':
      {
        const updatedFields = state.extractionFields.map(field =>
          field.id === action.payload.id ? action.payload : field
        );
        localStorage.setItem('extractionFields', JSON.stringify(updatedFields));
        return { ...state, extractionFields: updatedFields };
      }
    case 'DELETE_EXTRACTION_FIELD':
      {
        const filteredFields = state.extractionFields.filter(field => field.id !== action.payload);
        localStorage.setItem('extractionFields', JSON.stringify(filteredFields));
        return { ...state, extractionFields: filteredFields };
      }
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'ADD_TAG':
      {
        const newTags = [...state.tags, action.payload];
        localStorage.setItem('tags', JSON.stringify(newTags));
        return { ...state, tags: newTags };
      }
    case 'UPDATE_TAG':
      {
        const updatedTags = state.tags.map(tag =>
          tag.id === action.payload.id ? action.payload : tag
        );
        localStorage.setItem('tags', JSON.stringify(updatedTags));
        return { ...state, tags: updatedTags };
      }
    case 'DELETE_TAG':
      {
        const filteredTags = state.tags.filter(tag => tag.id !== action.payload);
        localStorage.setItem('tags', JSON.stringify(filteredTags));
        return { ...state, tags: filteredTags };
      }
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Ensure localStorage is accessed only on the client side
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          dispatch({ type: 'LOGIN', payload: JSON.parse(storedUser) as User });
        } catch (e) {
          console.error("Failed to parse stored user", e);
          localStorage.removeItem('currentUser');
        }
      }

      const storedFields = localStorage.getItem('extractionFields');
      if (storedFields) {
         try {
          dispatch({ type: 'SET_EXTRACTION_FIELDS', payload: JSON.parse(storedFields) as ExtractionField[] });
        } catch (e) {
          console.error("Failed to parse stored fields", e);
          localStorage.removeItem('extractionFields');
          dispatch({ type: 'SET_EXTRACTION_FIELDS', payload: DEFAULT_EXTRACTION_FIELDS });
          localStorage.setItem('extractionFields', JSON.stringify(DEFAULT_EXTRACTION_FIELDS));
        }
      } else {
        dispatch({ type: 'SET_EXTRACTION_FIELDS', payload: DEFAULT_EXTRACTION_FIELDS });
        localStorage.setItem('extractionFields', JSON.stringify(DEFAULT_EXTRACTION_FIELDS));
      }

      const storedTags = localStorage.getItem('tags');
      if (storedTags) {
        try {
          dispatch({ type: 'SET_TAGS', payload: JSON.parse(storedTags) as Tag[] });
        } catch (e) {
          console.error("Failed to parse stored tags", e);
          localStorage.removeItem('tags');
          dispatch({ type: 'SET_TAGS', payload: DEFAULT_TAGS });
          localStorage.setItem('tags', JSON.stringify(DEFAULT_TAGS));
        }
      } else {
        dispatch({ type: 'SET_TAGS', payload: DEFAULT_TAGS });
        localStorage.setItem('tags', JSON.stringify(DEFAULT_TAGS));
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
