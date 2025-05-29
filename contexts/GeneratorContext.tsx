// contexts/GeneratorContext.tsx
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface GeneratorContextType {
  needsClear: boolean;
  setNeedsClear: Dispatch<SetStateAction<boolean>>;
  clearPasswordAction?: () => void;
  setClearPasswordAction: (action: (() => void) | undefined) => void;
}

const GeneratorContext = createContext<GeneratorContextType | undefined>(
  undefined
);

export const useGeneratorContext = () => {
  const context = useContext(GeneratorContext);
  if (!context) {
    throw new Error(
      "useGeneratorContext must be used within a GeneratorProvider"
    );
  }
  return context;
};

export const GeneratorProvider = ({ children }: { children: ReactNode }) => {
  const [needsClear, setNeedsClear] = useState(false);
  const [clearPasswordAction, setClearPasswordAction] = useState<
    (() => void) | undefined
  >(undefined);

  return (
    <GeneratorContext.Provider
      value={{
        needsClear,
        setNeedsClear,
        clearPasswordAction,
        setClearPasswordAction,
      }}
    >
      {children}
    </GeneratorContext.Provider>
  );
};
