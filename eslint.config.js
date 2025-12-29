import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default tseslint.config(
  { ignores: ['dist', '.eslintrc.cjs', 'node_modules', 'integration', 'android', 'public'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/set-state-in-effect': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', {
        ignore: [
          'geometry', 'material', 'position', 'rotation', 'scale',
          'castShadow', 'receiveShadow', 'args', 'attach',
          'vertexColors', 'roughness', 'metalness', 'transparent', 'side',
          'uniforms', 'vertexShader', 'fragmentShader', 'wireframe',
          'emissive', 'emissiveIntensity', 'color', 'opacity',
          'intensity', 'shadow-mapSize', 'shadow-camera-left', 'shadow-camera-right',
          'shadow-camera-top', 'shadow-camera-bottom', 'shadow-bias', 'shadow-radius',
          'fov', 'near', 'far', 'aspect', 'distance',
          'object', 'dispose', 'frustumCulled', 'visible', 'renderOrder',
        ]
      }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
    },
  },
);
