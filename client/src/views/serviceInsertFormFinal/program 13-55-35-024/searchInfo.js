import React, { useState, useEffect } from "react";
import { Grid, FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ko } from 'date-fns/locale';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Autocomplete from '@mui/material/Autocomplete';
import DateFormatter from 'utils/DateFormatter';

// Import GraphQL queries for dropdown data
import { GET_PROGRAM_CATEGORIES, GET_PROGRAMS_BY_CATEGORY, GET_INSTRUCTORS, GET_LOCATIONS } from "../../../graphql/menu";

// Agency list query
const GET_ORGANIZATION_LIST = gql`
  query GetPage1List {
    getPage1List {
      id
      group_name
      start_date
      end_date
    }
  }
`;

// Locations query - No longer needed as we're importing from menu.js
// const GET_LOCATIONS = gql`
//   query Locations {
//     locations {
//       id
//       location_name
//       category_id
//       description
//       created_at
//       updated_at
//     }
//   }
// `;

const SearchInfo = ({ searchInfo, onChange, onSearch }) => {
    // State for selected values and dropdown data
    const [organizations, setOrganizations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [locations, setLocations] = useState([]);

    // Query for organizations (agencies)
    const { loading: orgLoading } = useQuery(GET_ORGANIZATION_LIST, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data && data.getPage1List) {
                setOrganizations(data.getPage1List);
            }
        },
        onError: (error) => {
            console.error("[SearchInfo] Error fetching organizations:", error);
        }
    });

    // Query for program categories
    const { loading: catLoading } = useQuery(GET_PROGRAM_CATEGORIES, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data && data.programCategories) {
                setCategories(data.programCategories);
                console.log("[SearchInfo] Loaded program categories:", data.programCategories.length);
            }
        },
        onError: (error) => {
            console.error("[SearchInfo] Error fetching program categories:", error);
        }
    });

    // Query for programs based on selected category
    const { loading: progLoading, refetch: refetchPrograms } = useQuery(GET_PROGRAMS_BY_CATEGORY, {
        variables: { categoryId: searchInfo.program_category_id ? parseInt(searchInfo.program_category_id, 10) : 0 },
        skip: !searchInfo.program_category_id,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data && data.getProgramsByCategory) {
                setPrograms(data.getProgramsByCategory);
                setFilteredPrograms(data.getProgramsByCategory);
                console.log("[SearchInfo] Loaded programs for category:", data.getProgramsByCategory.length);
            }
        },
        onError: (error) => {
            console.error("[SearchInfo] Error fetching programs:", error);
        }
    });

    // Query for instructors
    const { loading: instLoading } = useQuery(GET_INSTRUCTORS, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data && data.instructors) {
                setInstructors(data.instructors);
                console.log("[SearchInfo] Loaded instructors:", data.instructors.length);
            }
        },
        onError: (error) => {
            console.error("[SearchInfo] Error fetching instructors:", error);
        }
    });

    // Query for locations
    const { loading: locLoading } = useQuery(GET_LOCATIONS, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data && data.locations) {
                setLocations(data.locations);
                // Also set filteredLocations initially to all locations
                setFilteredLocations(data.locations);
                console.log("[SearchInfo] Loaded locations:", data.locations.length);
            }
        },
        onError: (error) => {
            console.error("[SearchInfo] Error fetching locations:", error);
        }
    });

    // Filter locations when category changes
    useEffect(() => {
        if (searchInfo.program_category_id && locations.length > 0) {
            const categoryId = parseInt(searchInfo.program_category_id, 10);
            console.log("[SearchInfo] Filtering locations by category ID:", categoryId);
            
            // Filter locations that match the selected category
            const filtered = locations.filter(location => {
                return location.category_id === categoryId || 
                       location.category_id === String(categoryId);
            });
            
            if (filtered.length > 0) {
                console.log("[SearchInfo] Found", filtered.length, "matching locations");
                setFilteredLocations(filtered);
            } else {
                // If no specific locations for this category, show all locations
                console.log("[SearchInfo] No specific locations for this category, showing all");
                setFilteredLocations(locations);
            }
        } else {
            // When no category is selected, show all locations
            setFilteredLocations(locations);
        }
    }, [searchInfo.program_category_id, locations]);

    // Refetch programs when category changes
    useEffect(() => {
        if (searchInfo.program_category_id) {
            refetchPrograms({ categoryId: parseInt(searchInfo.program_category_id, 10) });
        }
    }, [searchInfo.program_category_id, refetchPrograms]);

    // Handle agency (organization) selection
    const handleAgencyChange = (event, newValue) => {
        if (!newValue) return;
        
        console.log("[SearchInfo] Agency selected:", newValue);
        
        if (typeof onChange === 'function') {
            onChange('agency', newValue.group_name || '');
            onChange('agency_id', newValue.id || null);
            // 기관 선택 시 시작일자 자동 설정
            if (newValue.start_date) {
                onChange('openday', newValue.start_date);
            }
        }
    };

    // Handle category selection
    const handleCategoryChange = (event) => {
        const categoryId = event.target.value;
        console.log("[SearchInfo] Category selected:", categoryId);
        
        if (typeof onChange === 'function') {
            onChange('program_category_id', categoryId || '');
            
            // Reset program and location selections when category changes
            onChange('program_id', '');
            onChange('program_name', '');
            onChange('location_name', '');
            onChange('place', '');
        }
    };

    // Handle program selection
    const handleProgramChange = (event) => {
        const programId = event.target.value;
        console.log("[SearchInfo] Program selected:", programId);
        
        if (typeof onChange === 'function') {
            onChange('program_id', programId || '');
            
            // Store program name locally for display purposes (but not sent to API)
            const selectedProgram = programs.find(prog => prog.id === programId);
            if (selectedProgram) {
                onChange('program_name', selectedProgram.program_name || '');
                console.log("[SearchInfo] Set program_name (UI only):", selectedProgram.program_name);
            } else {
                onChange('program_name', '');
            }
        }
    };

    // Handle instructor selection
    const handleInstructorChange = (event) => {
        const instructorId = event.target.value;
        console.log("[SearchInfo] Instructor selected:", instructorId);
        
        if (typeof onChange === 'function') {
            onChange('teacher_id', instructorId || '');
            
            // Set instructor name if available (for display purposes)
            const selectedInstructor = instructors.find(inst => inst.id === instructorId);
            if (selectedInstructor) {
                onChange('teacher_name', selectedInstructor.name || '');
            }
        }
    };

    // Handle place (location) selection
    const handlePlaceChange = (event) => {
        const locationId = event.target.value;
        console.log("[SearchInfo] Location selected:", locationId);
        
        if (typeof onChange === 'function') {
            // Store the location ID locally (but don't send to API)
            onChange('location_name', locationId || '');
            
            // Set location name as the place value (this is what the API expects)
            const selectedLocation = locations.find(loc => loc.id === locationId);
            if (selectedLocation) {
                onChange('place', selectedLocation.location_name || '');
            } else {
                onChange('place', '');
            }
        }
    };

    // Handle date changes
    const handleDateChange = (field, value) => {
        if (!value) return;
        
        const formattedDate = DateFormatter.format(value);
        console.log(`[SearchInfo] Date ${field} changed:`, formattedDate);
        
        if (typeof onChange === 'function') {
            onChange(field, formattedDate);
        }
    };

    // Find selected organization (agency)
    const selectedAgency = organizations.find(org => 
        org.group_name === searchInfo.agency || org.id === searchInfo.agency_id
    );

    // Find selected location
    const selectedLocation = locations.find(loc => 
        loc.id === searchInfo.location_name || loc.location_name === searchInfo.place
    );
    
    console.log("[DEBUG-SearchInfo] Rendering with:", {
        searchInfo_location_name: searchInfo.location_name,
        searchInfo_place: searchInfo.place,
        selectedLocation: selectedLocation ? {
            id: selectedLocation.id,
            name: selectedLocation.location_name
        } : 'none',
        totalLocations: locations.length,
        filteredLocations: filteredLocations.length
    });

    return (
        <Grid container spacing={2} alignItems="center" style={{ marginBottom: "15px" }}>
            {/* Agency (Organization) Dropdown */}
            <Grid item xs={12} md={3}>
                <Autocomplete
                    options={organizations}
                    getOptionLabel={(option) => option.group_name || ''}
                    value={selectedAgency || null}
                    onChange={handleAgencyChange}
                    loading={orgLoading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="기관명"
                    size="small"
                    fullWidth
                        />
                    )}
                />
            </Grid>

            {/* Start Date Picker */}
            <Grid item xs={12} md={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                    <DatePicker
                        label="시작일자"
                        value={searchInfo.openday ? new Date(searchInfo.openday) : null}
                        onChange={(value) => handleDateChange('openday', value)}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                </LocalizationProvider>
            </Grid>

            {/* Evaluation Date Picker */}
            <Grid item xs={12} md={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                    <DatePicker
                        label="실시일자"
                        value={searchInfo.eval_date ? new Date(searchInfo.eval_date) : null}
                        onChange={(value) => handleDateChange('eval_date', value)}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                </LocalizationProvider>
            </Grid>

            {/* Second row - 4 dropdowns in one row */}
            <Grid item xs={12} md={12}>
                <Grid container spacing={2}>
                    {/* Program Category Dropdown */}
                    <Grid item xs={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="category-select-label">프로그램 카테고리</InputLabel>
                            <MuiSelect
                                labelId="category-select-label"
                                value={searchInfo.program_category_id || ''}
                                onChange={handleCategoryChange}
                                label="프로그램 카테고리"
                            >
                                <MenuItem value="">
                                    <em>선택하세요</em>
                                </MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.category_name}
                                    </MenuItem>
                                ))}
                            </MuiSelect>
                            {catLoading && <CircularProgress size={20} style={{ position: 'absolute', right: 10, top: 10 }} />}
                        </FormControl>
                    </Grid>

                    {/* Program Dropdown */}
                    <Grid item xs={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="program-select-label">프로그램</InputLabel>
                            <MuiSelect
                                labelId="program-select-label"
                                value={searchInfo.program_id || ''}
                                onChange={handleProgramChange}
                                label="프로그램"
                                disabled={!searchInfo.program_category_id}
                            >
                                <MenuItem value="">
                                    <em>선택하세요</em>
                                </MenuItem>
                                {filteredPrograms.map((program) => {
                                    return (
                                        <MenuItem key={program.id} value={program.id}>
                                            {program.program_name}
                                        </MenuItem>
                                    );
                                })}
                            </MuiSelect>
                            {progLoading && <CircularProgress size={20} style={{ position: 'absolute', right: 10, top: 10 }} />}
                        </FormControl>
                    </Grid>

                    {/* Instructor Dropdown */}
                    <Grid item xs={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="instructor-select-label">강사</InputLabel>
                            <MuiSelect
                                labelId="instructor-select-label"
                                value={searchInfo.teacher_id || ''}
                                onChange={handleInstructorChange}
                                label="강사"
                            >
                                <MenuItem value="">
                                    <em>선택하세요</em>
                                </MenuItem>
                                {[...instructors]
                                    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                                    .map((instructor) => (
                                        <MenuItem key={instructor.id} value={instructor.id}>
                                            {instructor.name}
                                        </MenuItem>
                                    ))}
                            </MuiSelect>
                            {instLoading && <CircularProgress size={20} style={{ position: 'absolute', right: 10, top: 10 }} />}
                        </FormControl>
                    </Grid>

                    {/* Place Dropdown */}
                    <Grid item xs={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="location-select-label">장소</InputLabel>
                            <MuiSelect
                                labelId="location-select-label"
                                value={searchInfo.location_name || ''}
                                onChange={handlePlaceChange}
                                label="장소"
                                disabled={!searchInfo.program_category_id}
                            >
                                <MenuItem value="">
                                    <em>선택하세요</em>
                                </MenuItem>
                                {filteredLocations.map((location) => {
                                    console.log("[DEBUG-SearchInfo] Rendering location option:", {
                                        id: location.id,
                                        name: location.location_name,
                                        isSelected: location.id === searchInfo.location_name
                                    });
                                    return (
                                        <MenuItem key={location.id} value={location.id}>
                                            {location.location_name}
                                        </MenuItem>
                                    );
                                })}
                            </MuiSelect>
                            {locLoading && <CircularProgress size={20} style={{ position: 'absolute', right: 10, top: 10 }} />}
                        </FormControl>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};
        
export default SearchInfo;