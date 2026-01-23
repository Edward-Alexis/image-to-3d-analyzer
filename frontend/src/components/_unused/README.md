# 📦 Componentes No Usados

Esta carpeta contiene componentes que fueron creados pero actualmente no están en uso en la aplicación.

## Componentes Archivados:

### ImageUploader.tsx
- **Razón:** Funcionalidad ya cubierta por otros componentes
- **Estado:** .tsx en proyecto .jsx (inconsistencia)
- **Acción Futura:** Eliminar o convertir a .jsx si se necesita

### ErrorDiagnostics.jsx
- **Razón:** Sistema de diagnóstico actualmente deshabilitado
- **Relacionado:** diagnosticRoutes comentado en app.ts
- **Acción Futura:** Reactivar cuando se habiliten diagnosticRoutes

### SystemLogs.jsx
- **Razón:** Panel de administración no implementado
- **Estado:** Sin rutas ni integración
- **Acción Futura:** Integrar en panel admin futuro

### SystemStatus.jsx
- **Razón:** Dashboard de sistema no implementado
- **Estado:** Sin rutas ni integración
- **Acción Futura:** Integrar en panel admin futuro

### ConfigPanel.jsx
- **Razón:** Panel de configuración avanzado no usado
- **Estado:** ConfigContext existe pero sin UI
- **Acción Futura:** Integrar o usar settings simples

---

**Nota:** Estos archivos se mantienen para potencial uso futuro.
Si decides eliminarlos permanentemente, revisa primero cualquier dependencia oculta.
