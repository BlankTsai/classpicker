import { useState, useEffect } from 'react';
import { ClassTable } from './ClassTable';
import { useGlobalContext } from '../context/GlobalContext';
import { Loader2 } from 'lucide-react';
import { FilterDropdown, SearchBar } from './SearchAndFilter';
import { listorder } from '../constants/listorder';

export interface Course {
  開課序號: number;
  中文課程名稱: string;
  英文課程名稱: string;
  系所: string;
  學分: number;
  教師: string;
  地點時間: string;
}

export const ClassList: React.FC = () => {
  const { classData: courses, loading, setLoading } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get unique departments from the course data
  const departmentOptions = listorder.map(item => item.key);

  //Filter department options based on the department search term
  const filteredDepartmentOptions = departmentOptions.filter(department =>
    department.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  );

  const departmentOptionsWithAll = ['全部系所', ...filteredDepartmentOptions];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(handler); // Clean up the timeout on component unmount or when searchTerm changes
  }, [searchTerm]);

  // Calculate the courses to display based on pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredCourses = courses.filter(course => {
    const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
    const matchesSearch =
      (course.中文課程名稱 && course.中文課程名稱.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (course.英文課程名稱 && course.英文課程名稱.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (course.開課序號 && course.開課序號.toString().toLowerCase().includes(lowerCaseSearchTerm)) ||
      (course.教師 && course.教師.toLowerCase().includes(lowerCaseSearchTerm));
    const matchesDepartment = filterDepartment ? course.系所 === filterDepartment : true;
    return matchesSearch && matchesDepartment;
  });

  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    handlePageChange(1);
  }, [totalPages]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <FilterDropdown
          filterDepartment={filterDepartment}
          setFilterDepartment={setFilterDepartment}
          departmentSearchTerm={departmentSearchTerm}
          setDepartmentSearchTerm={setDepartmentSearchTerm}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          departmentOptionsWithAll={departmentOptionsWithAll}
        />
      </div>

      {loading ? (
        <div className="flex justify-center my-3">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <ClassTable
          courses={currentCourses}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          enableAddClasses
        />
      )}
    </div>
  );
};