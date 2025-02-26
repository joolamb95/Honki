import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

// 급여 정보 타입
export interface EmployeeSalary {
  baseSalary: number;
  bonus: number;
  paymentDate: string;
  totalSalary: number;
  lastUpdate : Date;
  jobTitle: string;
}

// Employee 타입 정의
export interface Employee {
  employeeNo: undefined;
  name: string;
  phone: string;
  hireDate: string;
  resignDate?: string;
  employeeStatus: boolean;
  birthDate?: string;
  gender?: string;
  email?: string;
  address?: string;
  lastUpdate?: Date;
  salary: EmployeeSalary; // ✅ salary가 항상 존재하도록 설정
}

// EmployeeContext 타입 정의
export interface EmployeeContextType {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

// Context 생성
export const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

const EmployeesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    axios.get('http://localhost:8080/honki/api/employees')
      .then((response) => {
        console.log("🔹 사원 목록 응답 데이터:", response.data);
        setEmployees(response.data);
      })
      .catch((error) => console.error('🚨 사원 목록 불러오기 실패:', error));
}, []);



  return (
    <EmployeeContext.Provider value={{ employees, setEmployees }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export default EmployeesProvider;
