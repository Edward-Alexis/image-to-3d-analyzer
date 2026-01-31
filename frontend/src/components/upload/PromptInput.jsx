import React, { useState } from 'react';
import { Type, Sparkles } from 'lucide-react';

const PromptInput = ({ value, onChange, disabled = false }) => {
    const [charCount, setCharCount] = useState(value?.length || 0);
    const maxChars = 500;

    const handleChange = (e) => {
        const newValue = e.target.value;
        if (newValue.length <= maxChars) {
            setCharCount(newValue.length);
            onChange(newValue);
        }
    };

    const examplePrompts = [
        "Soldado futurista con armadura táctica completa, casco con visor, chaleco antibalas",
        "Robot humanoide con detalles mecánicos, articulaciones visibles, estilo sci-fi",
        "Personaje de fantasía con armadura medieval, espada y escudo",
    ];

    const [showExamples, setShowExamples] = useState(false);

    return (
        <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Describe tu modelo 3D (opcional)
                </label>
                <button
                    type="button"
                    onClick={() => setShowExamples(!showExamples)}
                    className="text-xs text-purple-600 hover:text-purple-700 underline"
                >
                    {showExamples ? 'Ocultar' : 'Ver'} ejemplos
                </button>
            </div>

            {/* Examples */}
            {showExamples && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-purple-900">Ejemplos de prompts:</p>
                    {examplePrompts.map((example, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => {
                                setCharCount(example.length);
                                onChange(example);
                            }}
                            className="text-left w-full text-xs text-purple-700 hover:bg-purple-100 p-2 rounded transition-colors"
                        >
                            "{example}"
                        </button>
                    ))}
                </div>
            )}

            {/* Textarea */}
            <div className="relative">
                <textarea
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="Ejemplo: Crea un modelo 3D de un robot humanoide con armadura futurista, incluye casco, torso blindado, brazos articulados y piernas robóticas. Estilo: sci-fi, nivel de detalle alto."
                    className={`
            w-full min-h-[120px] px-4 py-3 
            border-2 border-slate-600 rounded-lg
            focus:border-purple-500 focus:ring-2 focus:ring-purple-200
            transition-all duration-200
            placeholder:text-slate-400 text-sm text-white
            resize-none
            ${disabled ? 'bg-slate-800/60 cursor-not-allowed' : 'bg-slate-900'}
          `}
                    rows={4}
                />

                {/* Character Counter */}
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {charCount}/{maxChars}
                </div>
            </div>

            {/* Help Text */}
            <div className="flex items-start gap-2 text-xs text-gray-600">
                <Type className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                <p>
                    Describe el modelo que deseas crear: partes específicas, estilo, nivel de detalle.
                    Esto ayudará a generar un modelo 3D más preciso.
                </p>
            </div>
        </div>
    );
};

export default PromptInput;
