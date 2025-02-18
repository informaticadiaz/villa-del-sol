```mermaid
gantt
    title Cronograma de Implementación - Villa del Sol
    dateFormat  YYYY-MM-DD
    section Fase 1: Preparación
    Configuración del entorno de desarrollo     :2025-02-18, 3d
    Configuración de repositorios Git          :2025-02-19, 2d
    Instalación de dependencias iniciales      :2025-02-20, 2d

    section Fase 2: Base de Datos
    Diseño del esquema DB                      :2025-02-21, 4d
    Implementación de scripts SQL              :2025-02-24, 3d
    Configuración ORM                          :2025-02-26, 2d

    section Fase 3: Backend (Must Have)
    Auth & Middleware básico                   :2025-02-28, 4d
    API Propietarios                          :2025-03-03, 3d
    API Apartamentos                          :2025-03-05, 3d
    API Visitantes                            :2025-03-07, 3d
    API Pagos                                 :2025-03-10, 3d
    API Reportes Básicos                      :2025-03-12, 3d

    section Fase 4: Frontend (Must Have)
    Configuración Next.js                     :2025-03-14, 2d
    Componentes comunes                       :2025-03-17, 4d
    Interfaces de autenticación               :2025-03-20, 3d
    Módulo de Propietarios                    :2025-03-22, 4d
    Módulo de Apartamentos                    :2025-03-25, 4d
    Módulo de Visitantes                      :2025-03-28, 4d
    Módulo de Pagos                          :2025-03-31, 4d
    
    section Fase 5: Should Have
    Filtros avanzados reportes               :2025-04-03, 4d
    Mejoras UI/UX                            :2025-04-06, 5d
    
    section Fase 6: Could Have
    Sistema de notificaciones                :2025-04-10, 5d
    Registro de comentarios                  :2025-04-14, 3d
    
    section Fase 7: Pruebas y Despliegue
    Pruebas unitarias                        :2025-04-16, 4d
    Pruebas de integración                   :2025-04-19, 4d
    Documentación final                      :2025-04-22, 3d
    Despliegue a producción                  :2025-04-24, 3d
``
