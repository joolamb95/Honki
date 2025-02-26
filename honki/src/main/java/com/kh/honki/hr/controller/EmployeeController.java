package com.kh.honki.hr.controller;

import com.kh.honki.hr.model.vo.*;
import com.kh.honki.hr.model.service.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @CrossOrigin(origins = {"http://localhost:5173"})
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    @CrossOrigin(origins = {"http://localhost:5173"})
    public Employee getEmployeeById(@PathVariable int id) {
        return employeeService.getEmployeeById(id);
    }

    @PostMapping
    @CrossOrigin(origins = {"http://localhost:5173"})
    public void saveEmployee(@RequestBody Employee employee) {
        employeeService.saveEmployee(employee);
    }

    @PutMapping("/{id}")
    @CrossOrigin(origins = {"http://localhost:5173"})
    public void updateEmployee(@PathVariable int id, @RequestBody Employee employee) {
        employee.setEmployeeNo(id);
        employeeService.updateEmployee(employee);
    }

    @DeleteMapping("/{id}")
    @CrossOrigin(origins = {"http://localhost:5173"})
    public void deleteEmployee(@PathVariable int id) {
        employeeService.deleteEmployee(id);
    }
    
}
