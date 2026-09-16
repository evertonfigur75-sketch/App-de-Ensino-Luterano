import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, StudentProfile, Role } from '../types';
import { dbService } from '../services/db';

interface AuthContextType {
  currentUser: User | StudentProfile | null;
  studentProfile: StudentProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isPending: boolean;
  isRejected: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: Omit<StudentProfile, 'id' | 'createdAt' | 'passwordHash' | 'salt'> & { password: string }) => Promise<{ success: boolean; message?: string; student?: StudentProfile }>;
  logout: () => void;
  updateProfile: (updates: Partial<StudentProfile> & Partial<User>) => Promise<boolean>;
  changePassword: (newPass: string) => Promise<boolean>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const user = dbService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    dbService.init().then(() => {
      refreshUser();
      setLoading(false);
    });
  }, [refreshUser]);

  const login = async (email: string, pass: string) => {
    const user = await dbService.verifyCredentials(email, pass);
    if (!user) {
      return { success: false, message: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
    }
    dbService.setCurrentUser(user);
    setCurrentUser(user);
    return { success: true };
  };

  const register = async (data: Omit<StudentProfile, 'id' | 'createdAt' | 'passwordHash' | 'salt'> & { password: string }) => {
    // Check if email already registered
    const students = dbService.getAllStudents();
    if (students.some(s => s.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'Já existe um cadastro com este e-mail.' };
    }

    try {
      const student = await dbService.registerStudent(data);
      // Auto-set session so user sees their pending status screen
      dbService.setCurrentUser(student);
      setCurrentUser(student);
      return { success: true, student };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar cadastro';
      return { success: false, message };
    }
  };

  const logout = () => {
    dbService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const updateProfile = async (updates: Partial<StudentProfile> & Partial<User>) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') {
      const updated = await dbService.updateAdminProfile(currentUser.id, updates as Partial<User>);
      if (updated) {
        setCurrentUser(updated);
        return true;
      }
      return false;
    } else {
      const updated = await dbService.updateStudentProfile(currentUser.id, updates as Partial<StudentProfile>);
      if (updated) {
        setCurrentUser(updated);
        return true;
      }
      return false;
    }
  };

  const changePassword = async (newPass: string) => {
    if (!currentUser) return false;
    return await dbService.changePassword(currentUser.id, newPass);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';
  const studentProfile = isStudent ? (currentUser as StudentProfile) : null;
  const isPending = isStudent && studentProfile?.status === 'pending';
  const isRejected = isStudent && studentProfile?.status === 'rejected';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentProfile,
        isAuthenticated: !!currentUser,
        isAdmin,
        isStudent,
        isPending,
        isRejected,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
