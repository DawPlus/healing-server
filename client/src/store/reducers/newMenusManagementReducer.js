import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // 현재 관리하고 있는 항목 유형 (place, location_category, instructor, assistant, helper, program, program_category, room)
  currentType: null,
  
  // 각 항목 유형별 목록
  lists: {
    place: [],
    location_category: [],
    instructor: [],
    assistant: [],
    helper: [],
    program: [],
    program_category: [],
    room: []
  },
  
  // 선택된 항목 (편집 시 사용)
  selectedItem: null,
  
  // 폼 데이터 (생성/편집 시 사용)
  formData: {
    id: null,
    name: '',
    description: '',
    // 추가 필드는 항목 유형에 따라 다름
  },
  
  // UI 상태
  isLoading: false,
  isFormOpen: false,
  isEditMode: false,
  error: null,
  
  roomFields: [
    {
      id: 'room_type',
      label: '객실 타입',
      type: 'select',
      options: [
        { value: '일반', label: '일반' },
        { value: '프리미엄', label: '프리미엄' },
        { value: 'VIP', label: 'VIP' },
        { value: '단체실', label: '단체실' },
      ],
      dbField: 'room_type'
    },
    { id: 'room_name', label: '객실명', type: 'text', dbField: 'room_name' },
    { id: 'capacity', label: '수용인원', type: 'number', dbField: 'capacity' },
    { id: 'price', label: '가격', type: 'number', dbField: 'price' },
    { id: 'description', label: '설명', type: 'textarea', dbField: 'description' },
    { id: 'facilities', label: '편의시설', type: 'textarea', dbField: 'facilities' },
    { id: 'is_available', label: '사용가능', type: 'checkbox', dbField: 'is_available' },
    { id: 'display_order', label: '표시순서', type: 'number', dbField: 'display_order' },
  ],
  
  roomInitialForm: {
    room_type: '일반',
    room_name: '',
    capacity: 2,
    price: 0,
    description: '',
    facilities: '',
    is_available: true,
    display_order: 0,
  },
};

// Slice
const newMenusManagementSlice = createSlice({
  name: 'newMenusManagement',
  initialState,
  reducers: {
    // 일반 액션
    startLoading: (state) => {
      state.isLoading = true;
    },
    finishLoading: (state) => {
      state.isLoading = false;
    },
    setCurrentType: (state, action) => {
      state.currentType = action.payload;
    },
    
    // 목록 관련 액션
    setList: (state, action) => {
      const { type, data } = action.payload;
      state.lists[type] = data || [];
    },
    
    // 선택 및 폼 액션
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
      if (action.payload) {
        state.formData = { ...action.payload };
        state.isEditMode = true;
      } else {
        state.formData = { 
          id: null,
          name: '',
          description: ''
        };
        state.isEditMode = false;
      }
    },
    clearSelection: (state) => {
      state.selectedItem = null;
      state.formData = {
        id: null,
        name: '',
        description: '',
        // 유형별 기본 필드
        capacity: '',
        specialty: '',
        contact: '',
        field: '',
        category_id: '',
        // Room fields
        room_type: '일반',
        room_name: '',
        price: 0,
        facilities: '',
        is_available: 1,
        display_order: 0
      };
      state.isEditMode = false;
    },
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    
    // 모달 제어
    openForm: (state) => {
      state.isFormOpen = true;
    },
    closeForm: (state) => {
      state.isFormOpen = false;
    },
    
    // 에러 관리
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Saga 액션 타입 (실제 구현은 saga 파일에서)
    fetchItems: () => {}, // payload: type
    saveItem: () => {}, // payload: { type, data }
    deleteItem: () => {} // payload: { type, id }
  }
});

// 액션 생성자
export const actions = newMenusManagementSlice.actions;

// 상태 셀렉터
export const getState = (state) => state.newMenusManagement;

// 리듀서
export const reducer = newMenusManagementSlice.reducer; 