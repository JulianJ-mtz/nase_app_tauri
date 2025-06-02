// lib/googleDriveUpload.ts - Configuración corregida

import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell"; // Cambio aquí
import * as XLSX from "xlsx";
import { useState, useEffect } from "react";

// Configuración de Google Drive API
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = "http://127.0.0.1:8080/oauth/callback";
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const APP_NAME = "NASE CLOUD";

interface GoogleTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
}

interface DriveUploadResponse {
    id: string;
    name: string;
    webViewLink: string;
    webContentLink: string;
}

class GoogleDriveUploader {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() {
        // Load saved tokens on initialization
        this.loadTokensFromStorage();
    }

    // Load tokens from localStorage
    private loadTokensFromStorage(): void {
        try {
            if (typeof window !== 'undefined') {
                const savedAccessToken = localStorage.getItem('gdrive_access_token');
                const savedRefreshToken = localStorage.getItem('gdrive_refresh_token');
                const savedExpiry = localStorage.getItem('gdrive_token_expiry');

                if (savedAccessToken && savedRefreshToken && savedExpiry) {
                    this.accessToken = savedAccessToken;
                    this.refreshToken = savedRefreshToken;
                    this.tokenExpiry = parseInt(savedExpiry);

                    console.log('Tokens cargados desde almacenamiento local');
                }
            }
        } catch (error) {
            console.error('Error cargando tokens:', error);
        }
    }

    // Save tokens to localStorage
    private saveTokensToStorage(): void {
        try {
            if (typeof window !== 'undefined' && this.accessToken && this.refreshToken) {
                localStorage.setItem('gdrive_access_token', this.accessToken);
                localStorage.setItem('gdrive_refresh_token', this.refreshToken);
                localStorage.setItem('gdrive_token_expiry', this.tokenExpiry.toString());

                console.log('Tokens guardados en almacenamiento local');
            }
        } catch (error) {
            console.error('Error guardando tokens:', error);
        }
    }

    // Clear tokens from localStorage
    public clearTokensFromStorage(): void {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('gdrive_access_token');
                localStorage.removeItem('gdrive_refresh_token');
                localStorage.removeItem('gdrive_token_expiry');

                console.log('Tokens eliminados del almacenamiento local');
            }

            // Also clear in-memory tokens
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = 0;
        } catch (error) {
            console.error('Error eliminando tokens:', error);
        }
    }

    // Check if we have valid tokens (including checking expiry)
    public isAuthenticated(): boolean {
        if (!this.accessToken || !this.refreshToken) {
            return false;
        }

        // Check if token is expired (with 5 minute buffer)
        const now = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes

        return now < (this.tokenExpiry - bufferTime);
    }

    // Paso 1: Iniciar autenticación OAuth2
    async authenticate(): Promise<boolean> {
        try {
            const authUrl =
                `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${GOOGLE_CLIENT_ID}&` +
                `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
                `response_type=code&` +
                `scope=${encodeURIComponent(SCOPES)}&` +
                `access_type=offline&` +
                `prompt=consent`;

            console.log("Abriendo URL de autenticación:", authUrl);

            // Abrir el navegador con la URL de autenticación
            await open(authUrl);

            // Obtener el código de autorización usando tu comando Rust
            const authCode = await this.getAuthorizationCode();

            if (!authCode) {
                throw new Error("No se obtuvo el código de autorización");
            }

            console.log("Código de autorización obtenido:", authCode.substring(0, 10) + "...");

            // Intercambiar código por tokens
            const tokens = await this.exchangeCodeForTokens(authCode);

            this.accessToken = tokens.access_token;
            this.refreshToken = tokens.refresh_token || null;
            this.tokenExpiry = Date.now() + tokens.expires_in * 1000;

            // Save tokens to localStorage
            this.saveTokensToStorage();

            console.log("Autenticación exitosa");
            return true;
        } catch (error) {
            console.error("Error en autenticación:", error);
            this.clearTokensFromStorage();
            return false;
        }
    }

    // Método para obtener el código de autorización
    private async getAuthorizationCode(): Promise<string | null> {
        try {
            console.log("Esperando código OAuth...");
            const code = await invoke("get_oauth_code");
            return code as string;
        } catch (error) {
            console.error("Error obteniendo código OAuth:", error);
            return null;
        }
    }

    // Intercambiar código de autorización por tokens
    private async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
        console.log("Intercambiando código por tokens...");

        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                code: code,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(`Error intercambiando código: ${response.statusText}`);
        }

        const tokens = await response.json();
        console.log("Tokens obtenidos exitosamente");
        return tokens;
    }

    // Resto de métodos permanecen igual...
    // (refrescar token, subir archivos, etc.)

    private async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) {
            console.log('No hay refresh token disponible');
            this.clearTokensFromStorage();
            return false;
        }

        try {
            console.log('Refrescando access token...');
            const response = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    refresh_token: this.refreshToken,
                    grant_type: "refresh_token",
                }),
            });

            if (!response.ok) {
                console.error('Error refrescando token:', response.statusText);
                this.clearTokensFromStorage();
                return false;
            }

            const tokens: GoogleTokenResponse = await response.json();
            this.accessToken = tokens.access_token;
            this.tokenExpiry = Date.now() + tokens.expires_in * 1000;

            // Save updated tokens
            this.saveTokensToStorage();
            console.log('Access token refrescado exitosamente');

            return true;
        } catch (error) {
            console.error("Error refrescando token:", error);
            this.clearTokensFromStorage();
            return false;
        }
    }

    private async ensureValidToken(): Promise<boolean> {
        // First check if we have valid stored tokens
        if (this.isAuthenticated()) {
            return true;
        }

        // If we have a refresh token, try to refresh
        if (this.refreshToken) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
                return true;
            }
        }

        // If all else fails, need to re-authenticate
        console.log('Tokens inválidos, requiere nueva autenticación');
        return false;
    }

    async uploadFile(
        fileContent: string | Uint8Array,
        fileName: string,
        mimeType: string,
        folderId?: string
    ): Promise<DriveUploadResponse> {
        if (!(await this.ensureValidToken())) {
            throw new Error("No se pudo obtener token de acceso válido");
        }

        const metadata = {
            name: fileName,
            ...(folderId && { parents: [folderId] }),
        };

        const form = new FormData();
        form.append(
            "metadata",
            new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );

        let fileBlob: Blob;
        if (typeof fileContent === "string") {
            fileBlob = new Blob([fileContent], { type: mimeType });
        } else {
            fileBlob = new Blob([fileContent], { type: mimeType });
        }

        form.append("file", fileBlob);

        const response = await fetch(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
                body: form,
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error uploading file:", errorText);
            throw new Error(`Error subiendo archivo: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    }

    async createFolder(folderName: string, parentFolderId?: string): Promise<string> {
        if (!(await this.ensureValidToken())) {
            throw new Error("No se pudo obtener token de acceso válido");
        }

        const metadata = {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            ...(parentFolderId && { parents: [parentFolderId] }),
        };

        const response = await fetch(
            "https://www.googleapis.com/drive/v3/files",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(metadata),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error creating folder:", errorText);
            throw new Error(`Error creando carpeta: ${response.statusText}`);
        }

        const result = await response.json();
        return result.id;
    }

    // Search for folders by name
    async searchFolders(folderName: string): Promise<string | null> {
        if (!(await this.ensureValidToken())) {
            throw new Error("No se pudo obtener token de acceso válido");
        }

        const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );

        if (!response.ok) {
            console.error("Error searching folders:", response.statusText);
            return null;
        }

        const result = await response.json();

        if (result.files && result.files.length > 0) {
            console.log(`Carpeta "${folderName}" encontrada:`, result.files[0].id);
            return result.files[0].id;
        }

        return null;
    }

    // Get or create the app folder
    async getOrCreateAppFolder(): Promise<string> {
        try {
            // First, try to find existing folder
            const existingFolderId = await this.searchFolders(APP_NAME);

            if (existingFolderId) {
                return existingFolderId;
            }

            // If not found, create new folder
            console.log(`Creando carpeta "${APP_NAME}" en Google Drive...`);
            const newFolderId = await this.createFolder(APP_NAME);
            console.log(`Carpeta "${APP_NAME}" creada exitosamente:`, newFolderId);

            return newFolderId;
        } catch (error) {
            console.error("Error gestionando carpeta de la app:", error);
            throw error;
        }
    }

    // Search for folders by name within a parent folder
    async searchFoldersInParent(folderName: string, parentFolderId: string): Promise<string | null> {
        if (!(await this.ensureValidToken())) {
            throw new Error("No se pudo obtener token de acceso válido");
        }

        const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`;
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );

        if (!response.ok) {
            console.error("Error searching folders in parent:", response.statusText);
            return null;
        }

        const result = await response.json();

        if (result.files && result.files.length > 0) {
            console.log(`Carpeta "${folderName}" encontrada en padre ${parentFolderId}:`, result.files[0].id);
            return result.files[0].id;
        }

        return null;
    }

    // Get or create metrics folder structure: NASE CLOUD/metricas/produccion
    async getOrCreateMetricsFolders(): Promise<{ metricas: string; produccion: string }> {
        try {
            // First, get or create the main app folder (NASE CLOUD)
            const appFolderId = await this.getOrCreateAppFolder();

            // Get or create "metricas" folder
            let metricasFolderId = await this.searchFoldersInParent("metricas", appFolderId);
            if (!metricasFolderId) {
                console.log('Creando carpeta "metricas" en NASE CLOUD...');
                metricasFolderId = await this.createFolder("metricas", appFolderId);
                console.log('Carpeta "metricas" creada exitosamente:', metricasFolderId);
            }

            // Get or create "produccion" folder inside "metricas"
            let produccionFolderId = await this.searchFoldersInParent("produccion", metricasFolderId);
            if (!produccionFolderId) {
                console.log('Creando carpeta "produccion" en metricas...');
                produccionFolderId = await this.createFolder("produccion", metricasFolderId);
                console.log('Carpeta "produccion" creada exitosamente:', produccionFolderId);
            }

            return {
                metricas: metricasFolderId,
                produccion: produccionFolderId,
            };
        } catch (error) {
            console.error("Error gestionando carpetas de métricas:", error);
            throw error;
        }
    }

    // Get or create only the metrics folder: NASE CLOUD/Metricas
    async getOrCreateMetricsFolder(): Promise<string> {
        try {
            // First, get or create the main app folder (NASE CLOUD)
            const appFolderId = await this.getOrCreateAppFolder();

            // Get or create "Metricas" folder (con M mayúscula)
            let metricasFolderId = await this.searchFoldersInParent("Metricas", appFolderId);
            if (!metricasFolderId) {
                console.log('Creando carpeta "Metricas" en NASE CLOUD...');
                metricasFolderId = await this.createFolder("Metricas", appFolderId);
                console.log('Carpeta "Metricas" creada exitosamente:', metricasFolderId);
            }

            return metricasFolderId;
        } catch (error) {
            console.error("Error gestionando carpeta de Metricas:", error);
            throw error;
        }
    }

    // Get or create production folder: NASE CLOUD/Produccion
    async getOrCreateProductionFolder(): Promise<string> {
        try {
            // First, get or create the main app folder (NASE CLOUD)
            const appFolderId = await this.getOrCreateAppFolder();

            // Get or create "Produccion" folder (con P mayúscula)
            let produccionFolderId = await this.searchFoldersInParent("Produccion", appFolderId);
            if (!produccionFolderId) {
                console.log('Creando carpeta "Produccion" en NASE CLOUD...');
                produccionFolderId = await this.createFolder("Produccion", appFolderId);
                console.log('Carpeta "Produccion" creada exitosamente:', produccionFolderId);
            }

            return produccionFolderId;
        } catch (error) {
            console.error("Error gestionando carpeta de Produccion:", error);
            throw error;
        }
    }
}

// Instancia singleton del uploader
export const googleDriveUploader = new GoogleDriveUploader();

// Hook de React mejorado
export const useGoogleDriveUpload = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const authenticated = googleDriveUploader.isAuthenticated();
                setIsAuthenticated(authenticated);

                if (authenticated) {
                    console.log('Usuario ya autenticado con Google Drive');
                }
            } catch (error) {
                console.error('Error verificando estado de autenticación:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        checkAuthStatus();
    }, []);

    const authenticate = async (): Promise<boolean> => {
        try {
            setError(null);
            setIsInitializing(true);

            const success = await googleDriveUploader.authenticate();
            setIsAuthenticated(success);

            if (!success) {
                setError("Falló la autenticación con Google Drive");
            }

            return success;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            console.error("Error en autenticación:", error);
            setError(errorMessage);
            setIsAuthenticated(false);
            return false;
        } finally {
            setIsInitializing(false);
        }
    };

    const uploadFile = async (
        fileContent: string | Uint8Array,
        fileName: string,
        mimeType: string,
        folderId?: string
    ) => {
        setIsUploading(true);
        setError(null);

        try {
            // Check if we need to re-authenticate
            if (!googleDriveUploader.isAuthenticated()) {
                const authSuccess = await authenticate();
                if (!authSuccess) {
                    throw new Error("No se pudo autenticar con Google Drive");
                }
            }

            const result = await googleDriveUploader.uploadFile(
                fileContent,
                fileName,
                mimeType,
                folderId
            );

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error subiendo archivo";
            setError(errorMessage);

            // If authentication failed, update state
            if (errorMessage.includes("autenticar") || errorMessage.includes("token")) {
                setIsAuthenticated(false);
            }

            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const uploadWithProgress = async (
        uploadFunction: () => Promise<any>,
        onProgress?: (progress: number) => void
    ) => {
        setIsUploading(true);
        setError(null);

        try {
            // Simulate progress for the upload process
            if (onProgress) {
                onProgress(10);
                await new Promise(resolve => setTimeout(resolve, 100));
                onProgress(30);
                await new Promise(resolve => setTimeout(resolve, 100));
                onProgress(50);
            }

            const result = await uploadFunction();

            if (onProgress) {
                onProgress(80);
                await new Promise(resolve => setTimeout(resolve, 100));
                onProgress(100);
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error subiendo archivo";
            setError(errorMessage);

            // If authentication failed, update state
            if (errorMessage.includes("autenticar") || errorMessage.includes("token")) {
                setIsAuthenticated(false);
            }

            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const logout = () => {
        googleDriveUploader.clearTokensFromStorage();
        setIsAuthenticated(false);
        setError(null);
    };

    return {
        isAuthenticated,
        isUploading,
        isInitializing,
        error,
        authenticate,
        uploadFile,
        uploadWithProgress,
        logout,
        uploader: googleDriveUploader,
    };
};

// Helper functions for CSV and Excel export
export const exportAndUploadCSV = async (
    data: any[],
    headers: string[],
    fileName: string,
    folderId?: string
): Promise<{ local: string; cloud: DriveUploadResponse }> => {
    // Create CSV content
    const csvContent = [
        headers.join(","),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in CSV
                if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || "";
            }).join(",")
        )
    ].join("\n");

    const finalFileName = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;

    // Save locally - convert string to Uint8Array
    const localPath = `exports/${finalFileName}`;
    const csvBuffer = new TextEncoder().encode(csvContent);
    await writeFile(localPath, csvBuffer, { baseDir: BaseDirectory.Document });

    // Get app folder ID (create if doesn't exist)
    const appFolderId = folderId || await googleDriveUploader.getOrCreateAppFolder();

    // Upload to Google Drive in app folder
    const cloudResult = await googleDriveUploader.uploadFile(
        csvContent,
        finalFileName,
        "text/csv",
        appFolderId
    );

    return {
        local: localPath,
        cloud: cloudResult
    };
};

export const exportAndUploadExcel = async (
    workbook: XLSX.WorkBook,
    fileName: string,
    folderId?: string
): Promise<{ local: string; cloud: DriveUploadResponse }> => {
    // Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const finalFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;

    // Save locally
    const localPath = `exports/${finalFileName}`;
    await writeFile(localPath, new Uint8Array(excelBuffer), { baseDir: BaseDirectory.Document });

    // Get app folder ID (create if doesn't exist)
    const appFolderId = folderId || await googleDriveUploader.getOrCreateAppFolder();

    // Upload to Google Drive in app folder
    const cloudResult = await googleDriveUploader.uploadFile(
        new Uint8Array(excelBuffer),
        finalFileName,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        appFolderId
    );

    return {
        local: localPath,
        cloud: cloudResult
    };
};

// Nueva función específica para métricas - subir a carpeta de métricas
export const exportAndUploadMetricsExcel = async (
    workbook: XLSX.WorkBook,
    fileName: string
): Promise<{ local: string; cloud: DriveUploadResponse; folder: string }> => {
    // Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const finalFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;

    // Save locally
    const localPath = `exports/${finalFileName}`;
    await writeFile(localPath, new Uint8Array(excelBuffer), { baseDir: BaseDirectory.Document });

    // Get or create metrics folder: NASE CLOUD/Metricas
    const metricasFolderId = await googleDriveUploader.getOrCreateMetricsFolder();

    // Upload to Google Drive in the Metricas folder
    const cloudResult = await googleDriveUploader.uploadFile(
        new Uint8Array(excelBuffer),
        finalFileName,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        metricasFolderId
    );

    return {
        local: localPath,
        cloud: cloudResult,
        folder: metricasFolderId
    };
};

// Nueva función específica para registros de producción - subir a carpeta de producción
export const exportAndUploadProductionExcel = async (
    workbook: XLSX.WorkBook,
    fileName: string
): Promise<{ local: string; cloud: DriveUploadResponse; folder: string }> => {
    // Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const finalFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;

    // Save locally
    const localPath = `exports/${finalFileName}`;
    await writeFile(localPath, new Uint8Array(excelBuffer), { baseDir: BaseDirectory.Document });

    // Get or create production folder: NASE CLOUD/Produccion
    const produccionFolderId = await googleDriveUploader.getOrCreateProductionFolder();

    // Upload to Google Drive in the Produccion folder
    const cloudResult = await googleDriveUploader.uploadFile(
        new Uint8Array(excelBuffer),
        finalFileName,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        produccionFolderId
    );

    return {
        local: localPath,
        cloud: cloudResult,
        folder: produccionFolderId
    };
};