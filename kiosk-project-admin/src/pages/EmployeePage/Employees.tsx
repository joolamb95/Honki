import React, { createContext, useState } from 'react';

// Employee 타입 정의
export interface Employee {
  id: string;
  name: string;
  position: string;
  contact: string;
  hireDate: string;
  resignDate?: string; // 퇴사일
  status: boolean;
  birthDate?: string; // 생년월일
  gender?: string; // 성별
  email?: string;
  address?: string;
  basicSalary: number;
  bonus: number;
  paymentDate: string;
  totalSalary: number;
  lastUpdate?: string; // 최근 변경일
}


// EmployeeContext 타입 정의
export interface EmployeeContextType {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

// Context 생성
export const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

const EmployeesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 's01',
      name: '김지수',
      position: '매니저',
      contact: '010-1234-5678',
      hireDate: '2024-09-21',
      status: true,
      basicSalary: 5500000,
      bonus: 2500000,
      paymentDate: '2025-02-10',
      totalSalary: 8000000,
    },
    {
      id: 's02',
      name: '박민수',
      position: '직원',
      contact: '010-9876-5432',
      hireDate: '2022-11-15',
      status: false,
      basicSalary: 4000000,
      bonus: 1500000,
      paymentDate: '2025-02-10',
      totalSalary: 5500000,
    },
  ]);

  return (
    <EmployeeContext.Provider value={{ employees, setEmployees }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export default EmployeesProvider;
