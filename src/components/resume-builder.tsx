"use client";

import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Download, Settings, Sparkles, X, RotateCcw, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type ButtonProps } from '@/components/ui/button';
import { type BadgeProps } from '@/components/ui/badge';

// 类型定义
interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface OpenSourceProject {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  highlights: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  openSourceProjects: OpenSourceProject[];
  skills: string[];
  jobIntention: string;
  mainTechStack: string[];
}

// 修复Select的类型错误
type AIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'gemini-pro';

interface AIConfig {
  apiUrl: string;
  apiKey: string;
  model: AIModel;
}

interface AppState {
  resumeData: ResumeData;
  aiConfig: AIConfig;
  isOptimizing: boolean;
  error: string | null;
}

// localStorage 相关常量
const STORAGE_KEY = 'resume-builder-data';
const AUTO_SAVE_DELAY = 1000; // 1秒延迟自动保存

// 从localStorage加载数据
const loadFromStorage = (): AppState | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 验证数据结构的完整性
      if (parsed.resumeData && parsed.aiConfig) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load data from localStorage:', error);
  }
  
  return null;
};

// 保存数据到localStorage
const saveToStorage = (state: AppState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save data to localStorage:', error);
  }
};

// 初始状态
const getInitialState = (): AppState => {
  const savedState = loadFromStorage();
  if (savedState) {
    return savedState;
  }
  
  return {
  resumeData: {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: ''
    },
    workExperience: [],
    education: [],
    openSourceProjects: [],
    skills: [],
    jobIntention: '',
    mainTechStack: []
  },
  aiConfig: {
    apiUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-3.5-turbo'
  },
  isOptimizing: false,
  error: null
  };
};

// Reducer
type AppAction = 
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'ADD_WORK_EXPERIENCE' }
  | { type: 'UPDATE_WORK_EXPERIENCE'; payload: { id: string; data: Partial<WorkExperience> } }
  | { type: 'DELETE_WORK_EXPERIENCE'; payload: string }
  | { type: 'ADD_EDUCATION' }
  | { type: 'UPDATE_EDUCATION'; payload: { id: string; data: Partial<Education> } }
  | { type: 'DELETE_EDUCATION'; payload: string }
  | { type: 'ADD_OPENSOURCE_PROJECT' }
  | { type: 'UPDATE_OPENSOURCE_PROJECT'; payload: { id: string; data: Partial<OpenSourceProject> } }
  | { type: 'DELETE_OPENSOURCE_PROJECT'; payload: string }
  | { type: 'ADD_PROJECT_TECH'; payload: { projectId: string; tech: string } }
  | { type: 'DELETE_PROJECT_TECH'; payload: { projectId: string; techIndex: number } }
  | { type: 'ADD_SKILL'; payload: string }
  | { type: 'DELETE_SKILL'; payload: number }
  | { type: 'UPDATE_JOB_INTENTION'; payload: string }
  | { type: 'ADD_MAIN_TECH'; payload: string }
  | { type: 'DELETE_MAIN_TECH'; payload: number }
  | { type: 'UPDATE_AI_CONFIG'; payload: Partial<AIConfig> }
  | { type: 'SET_OPTIMIZING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'OPTIMIZE_SUCCESS'; payload: ResumeData }
  | { type: 'RESET_DATA' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          personalInfo: { ...state.resumeData.personalInfo, ...action.payload }
        }
      };
    
    case 'ADD_WORK_EXPERIENCE':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          workExperience: [
            ...state.resumeData.workExperience,
            {
              id: Date.now().toString(),
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              current: false,
              description: ''
            }
          ]
        }
      };
    
    case 'UPDATE_WORK_EXPERIENCE':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          workExperience: state.resumeData.workExperience.map(exp =>
            exp.id === action.payload.id ? { ...exp, ...action.payload.data } : exp
          )
        }
      };
    
    case 'DELETE_WORK_EXPERIENCE':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          workExperience: state.resumeData.workExperience.filter(exp => exp.id !== action.payload)
        }
      };
    
    case 'ADD_EDUCATION':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          education: [
            ...state.resumeData.education,
            {
              id: Date.now().toString(),
              school: '',
              degree: '',
              major: '',
              startDate: '',
              endDate: '',
              gpa: ''
            }
          ]
        }
      };
    
    case 'UPDATE_EDUCATION':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          education: state.resumeData.education.map(edu =>
            edu.id === action.payload.id ? { ...edu, ...action.payload.data } : edu
          )
        }
      };
    
    case 'DELETE_EDUCATION':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          education: state.resumeData.education.filter(edu => edu.id !== action.payload)
        }
      };
    
    case 'ADD_OPENSOURCE_PROJECT':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          openSourceProjects: [
            ...state.resumeData.openSourceProjects,
            {
              id: Date.now().toString(),
              name: '',
              description: '',
              role: '',
              technologies: [],
              githubUrl: '',
              liveUrl: '',
              highlights: ''
            }
          ]
        }
      };
    
    case 'UPDATE_OPENSOURCE_PROJECT':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          openSourceProjects: state.resumeData.openSourceProjects.map(project =>
            project.id === action.payload.id ? { ...project, ...action.payload.data } : project
          )
        }
      };
    
    case 'DELETE_OPENSOURCE_PROJECT':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          openSourceProjects: state.resumeData.openSourceProjects.filter(project => project.id !== action.payload)
        }
      };
    
    case 'ADD_PROJECT_TECH':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          openSourceProjects: state.resumeData.openSourceProjects.map(project =>
            project.id === action.payload.projectId 
              ? { ...project, technologies: [...project.technologies, action.payload.tech] }
              : project
          )
        }
      };
    
    case 'DELETE_PROJECT_TECH':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          openSourceProjects: state.resumeData.openSourceProjects.map(project =>
            project.id === action.payload.projectId 
              ? { ...project, technologies: project.technologies.filter((_, index) => index !== action.payload.techIndex) }
              : project
          )
        }
      };
    
    case 'ADD_SKILL':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          skills: [...state.resumeData.skills, action.payload]
        }
      };
    
    case 'DELETE_SKILL':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          skills: state.resumeData.skills.filter((_, index) => index !== action.payload)
        }
      };
    
    case 'UPDATE_JOB_INTENTION':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          jobIntention: action.payload
        }
      };
    
    case 'ADD_MAIN_TECH':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          mainTechStack: [...state.resumeData.mainTechStack, action.payload]
        }
      };
    
    case 'DELETE_MAIN_TECH':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          mainTechStack: state.resumeData.mainTechStack.filter((_, index) => index !== action.payload)
        }
      };
    
    case 'UPDATE_AI_CONFIG':
      return {
        ...state,
        aiConfig: { ...state.aiConfig, ...action.payload }
      };
    
    case 'SET_OPTIMIZING':
      return { ...state, isOptimizing: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'OPTIMIZE_SUCCESS':
      return {
        ...state,
        resumeData: action.payload,
        isOptimizing: false,
        error: null
      };
    
    case 'RESET_DATA':
      return getInitialState();
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// 组件定义
function PersonalInfoEditor() {
  const { state, dispatch } = useAppContext();
  const { personalInfo } = state.resumeData;

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { [field]: value } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={personalInfo.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="请输入姓名"
              aria-label="姓名"
            />
          </div>
          <div>
            <Label htmlFor="phone">手机号 *</Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="请输入手机号"
              aria-label="手机号"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">邮箱 *</Label>
          <Input
            id="email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="请输入邮箱"
            aria-label="邮箱"
          />
        </div>
        <div>
          <Label htmlFor="address">地址</Label>
          <Input
            id="address"
            value={personalInfo.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="请输入地址"
            aria-label="地址"
          />
        </div>
        <div>
          <Label htmlFor="summary">个人简介</Label>
          <Textarea
            id="summary"
            value={personalInfo.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="请输入个人简介"
            rows={4}
            aria-label="个人简介"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function WorkExperienceEditor() {
  const { state, dispatch } = useAppContext();
  const { workExperience } = state.resumeData;

  const handleAdd = () => {
    dispatch({ type: 'ADD_WORK_EXPERIENCE' });
  };

  const handleUpdate = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    dispatch({ type: 'UPDATE_WORK_EXPERIENCE', payload: { id, data: { [field]: value } } });
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_WORK_EXPERIENCE', payload: id });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>工作经历</CardTitle>
        <Button onClick={handleAdd} aria-label="添加工作经历">
          <Plus className="w-4 h-4 mr-2" />
          添加
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {workExperience.map((exp) => (
          <div key={exp.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">工作经历</h4>
              <Button
                variant="ghost"
                onClick={() => handleDelete(exp.id)}
                aria-label="删除工作经历"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>公司名称</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => handleUpdate(exp.id, 'company', e.target.value)}
                  placeholder="请输入公司名称"
                />
              </div>
              <div>
                <Label>职位</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => handleUpdate(exp.id, 'position', e.target.value)}
                  placeholder="请输入职位"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>开始时间</Label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => handleUpdate(exp.id, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <Label>结束时间</Label>
                <Input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => handleUpdate(exp.id, 'endDate', e.target.value)}
                  disabled={exp.current}
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id={`current-${exp.id}`}
                    checked={exp.current}
                    onChange={(e) => handleUpdate(exp.id, 'current', e.target.checked)}
                    className="mr-2"
                  />
                  <Label htmlFor={`current-${exp.id}`}>至今</Label>
                </div>
              </div>
            </div>
            <div>
              <Label>工作描述</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => handleUpdate(exp.id, 'description', e.target.value)}
                placeholder="请描述工作内容和成就"
                rows={3}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EducationEditor() {
  const { state, dispatch } = useAppContext();
  const { education } = state.resumeData;

  const handleAdd = () => {
    dispatch({ type: 'ADD_EDUCATION' });
  };

  const handleUpdate = (id: string, field: keyof Education, value: string) => {
    dispatch({ type: 'UPDATE_EDUCATION', payload: { id, data: { [field]: value } } });
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_EDUCATION', payload: id });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>教育背景</CardTitle>
        <Button 
          onClick={handleAdd} 
          className="h-9 rounded-md px-3"
          aria-label="添加教育背景"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.map((edu) => (
          <div key={edu.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">教育经历</h4>
              <Button
                variant="ghost"
                onClick={() => handleDelete(edu.id)}
                aria-label="删除教育背景"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>学校名称</Label>
                <Input
                  value={edu.school}
                  onChange={(e) => handleUpdate(edu.id, 'school', e.target.value)}
                  placeholder="请输入学校名称"
                />
              </div>
              <div>
                <Label>学历</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => handleUpdate(edu.id, 'degree', e.target.value)}
                  placeholder="如：本科、硕士"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>专业</Label>
                <Input
                  value={edu.major}
                  onChange={(e) => handleUpdate(edu.id, 'major', e.target.value)}
                  placeholder="请输入专业"
                />
              </div>
              <div>
                <Label>GPA（可选）</Label>
                <Input
                  value={edu.gpa || ''}
                  onChange={(e) => handleUpdate(edu.id, 'gpa', e.target.value)}
                  placeholder="如：3.8/4.0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>开始时间</Label>
                <Input
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => handleUpdate(edu.id, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <Label>结束时间</Label>
                <Input
                  type="month"
                  value={edu.endDate}
                  onChange={(e) => handleUpdate(edu.id, 'endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SkillsEditor() {
    const { state, dispatch } = useAppContext();
  const { skills } = state.resumeData;
  const [newSkill, setNewSkill] = useState('');

  const handleAdd = () => {
    if (newSkill.trim()) {
      dispatch({ type: 'ADD_SKILL', payload: newSkill.trim() });
      setNewSkill('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleDelete = (index: number) => {
    dispatch({ type: 'DELETE_SKILL', payload: index });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>技术技能</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 技能输入区域 */}
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入技能后按回车添加"
            aria-label="新技能"
          />
          <Button 
            onClick={handleAdd}
            className="h-9 rounded-md px-3"
            aria-label="添加技能"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* 技能标签显示区域 */}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-900">
              {skill}
              <button
                type="button"
                className="h-auto p-0 ml-1 text-gray-600 hover:text-gray-800"
                onClick={() => handleDelete(index)}
                aria-label={`删除技能 ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        
        {/* 空状态提示 */}
        {skills.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">还没有添加技能</p>
            <p className="text-xs mt-1">在上方输入框中添加您掌握的技术技能</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

}

function OpenSourceProjectsEditor() {
  const { state, dispatch } = useAppContext();
  const { openSourceProjects } = state.resumeData;

  const handleAdd = () => {
    dispatch({ type: 'ADD_OPENSOURCE_PROJECT' });
  };

  const handleUpdate = (id: string, field: keyof OpenSourceProject, value: string) => {
    dispatch({ type: 'UPDATE_OPENSOURCE_PROJECT', payload: { id, data: { [field]: value } } });
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_OPENSOURCE_PROJECT', payload: id });
  };

  const handleAddTech = (projectId: string, tech: string) => {
    if (tech.trim()) {
      dispatch({ type: 'ADD_PROJECT_TECH', payload: { projectId, tech: tech.trim() } });
    }
  };

  const handleDeleteTech = (projectId: string, techIndex: number) => {
    dispatch({ type: 'DELETE_PROJECT_TECH', payload: { projectId, techIndex } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>开源项目</CardTitle>
        <Button 
          onClick={handleAdd}
          className="h-9 rounded-md px-3"
          aria-label="添加开源项目"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {openSourceProjects.map((project) => (
          <ProjectEditor
            key={project.id}
            project={project}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAddTech={handleAddTech}
            onDeleteTech={handleDeleteTech}
          />
        ))}
        {openSourceProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>还没有添加开源项目</p>
            <p className="text-sm mt-1">展示您参与的开源项目可以很好地证明您的技术能力</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProjectEditorProps {
  project: OpenSourceProject;
  onUpdate: (id: string, field: keyof OpenSourceProject, value: string) => void;
  onDelete: (id: string) => void;
  onAddTech: (projectId: string, tech: string) => void;
  onDeleteTech: (projectId: string, techIndex: number) => void;
}

function ProjectEditor({ project, onUpdate, onDelete, onAddTech, onDeleteTech }: ProjectEditorProps) {
  const [newTech, setNewTech] = useState('');

  const handleAddTechClick = () => {
    onAddTech(project.id, newTech);
    setNewTech('');
  };

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechClick();
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <h4 className="font-medium">开源项目</h4>
        <Button
          className="hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
          onClick={() => onDelete(project.id)}
          aria-label="删除开源项目"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>项目名称 *</Label>
          <Input
            value={project.name}
            onChange={(e) => onUpdate(project.id, 'name', e.target.value)}
            placeholder="请输入项目名称"
          />
        </div>
        <div>
          <Label>参与角色</Label>
          <Input
            value={project.role}
            onChange={(e) => onUpdate(project.id, 'role', e.target.value)}
            placeholder="如：核心贡献者、维护者、协作者"
          />
        </div>
      </div>

      <div>
        <Label>项目描述 *</Label>
        <Textarea
          value={project.description}
          onChange={(e) => onUpdate(project.id, 'description', e.target.value)}
          placeholder="简要描述项目的功能和目标"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>GitHub 地址 *</Label>
          <Input
            type="url"
            value={project.githubUrl}
            onChange={(e) => onUpdate(project.id, 'githubUrl', e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <Label>演示地址（可选）</Label>
          <Input
            type="url"
            value={project.liveUrl || ''}
            onChange={(e) => onUpdate(project.id, 'liveUrl', e.target.value)}
            placeholder="https://demo.example.com"
          />
        </div>
      </div>

      <div>
        <Label>技术栈</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyDown={handleTechKeyDown}
            placeholder="输入技术栈后按回车添加"
          />
          <Button 
            onClick={handleAddTechClick}
            className="h-9 rounded-md px-3"
            aria-label="添加技术栈"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="text-gray-900 text-xs font-bold mr-2"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div>
        <Label>主要贡献与亮点</Label>
        <Textarea
          value={project.highlights}
          onChange={(e) => onUpdate(project.id, 'highlights', e.target.value)}
          placeholder="描述您在项目中的主要贡献、解决的问题、获得的成果等"
          rows={3}
        />
      </div>
    </div>
  );
}
  

function JobIntentionEditor() {
  const { state, dispatch } = useAppContext();
  const { jobIntention, mainTechStack } = state.resumeData;
  const [newTech, setNewTech] = useState('');

  const handleAddTech = () => {
    if (newTech.trim()) {
      dispatch({ type: 'ADD_MAIN_TECH', payload: newTech.trim() });
      setNewTech('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleDeleteTech = (index: number) => {
    dispatch({ type: 'DELETE_MAIN_TECH', payload: index });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>求职意向</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="job-intention">求职意向</Label>
          <Textarea
            id="job-intention"
            value={jobIntention}
            onChange={(e) => dispatch({ type: 'UPDATE_JOB_INTENTION', payload: e.target.value })}
            placeholder="请描述您的求职意向，包括期望职位、行业等"
            rows={3}
            aria-label="求职意向"
          />
        </div>
        
        <div>
          <Label htmlFor="main-tech">主要技术栈</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="main-tech"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入主要技术栈后按回车添加（如：React, Node.js, Python）"
              aria-label="新技术栈"
            />
            <Button 
              onClick={handleAddTech} 
              className="h-9 rounded-md px-3"
              aria-label="添加主要技术栈"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {mainTechStack.map((tech, index) => (
              <div 
                key={index} 
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
              >
                {tech}
                <button
                  type="button"
                  className="h-auto p-0 ml-1 text-blue-600 hover:text-blue-800"
                  onClick={() => handleDeleteTech(index)}
                  aria-label={`删除主要技术栈 ${tech}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          {mainTechStack.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              建议添加3-5个核心技术栈，突出您的专业领域
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ResumePreview() {
  const { state } = useAppContext();
  const { personalInfo, workExperience, education, openSourceProjects, skills, jobIntention, mainTechStack } = state.resumeData;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    return `${year}年${month}月`;
  };

  return (
    <div className="bg-white p-6 shadow-lg min-h-full print:shadow-none print:p-4">
      {/* 个人信息 */}
              <div className="text-center mb-6 print:mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 print:text-2xl print:mb-3">{personalInfo.name || '姓名'}</h1>
        <div className="flex justify-center items-center gap-4 text-gray-600 text-sm print:gap-6 print:flex-wrap">
          {personalInfo.email && <span className="print:break-words">{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.address && <span className="print:break-words">{personalInfo.address}</span>}
        </div>
      </div>

      {/* 个人简介 */}
      {personalInfo.summary && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            个人简介
          </h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line  text-sm">
            {personalInfo.summary}
          </div>
        </div>
      )}

      {/* 求职意向 */}
      {jobIntention && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            求职意向
          </h2>
          <p className="text-gray-700 leading-relaxed">{jobIntention}</p>
        </div>
      )}

      {/* 主要技术栈 */}
      {mainTechStack.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            主要技术栈
          </h2>
          <div className="flex flex-wrap gap-2">
            {mainTechStack.map((tech, index) => (
              <span
                key={index}
                className="text-gray-900 text-sm font-bold mr-3"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            工作经历
          </h2>
          <div className="space-y-4">
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-4 work-item">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {formatDate(exp.startDate)} - {exp.current ? '至今' : formatDate(exp.endDate)}
                  </div>
                </div>
                {exp.description && (
                  <div className="text-gray-700 text-sm leading-relaxed mt-2 whitespace-pre-line">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 教育背景 */}
      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
            教育背景
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                  <p className="text-gray-700">
                    {edu.degree} · {edu.major}
                    {edu.gpa && ` · GPA: ${edu.gpa}`}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 开源项目 */}
      {openSourceProjects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            开源项目
          </h2>
          <div className="space-y-4">
            {openSourceProjects.map((project) => (
              <div key={project.id} className="mb-4 project-item">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.role && (
                        <span className="text-sm text-gray-600">· {project.role}</span>
                      )}
                    </div>
                    <div className="text-gray-700 text-sm mb-2 whitespace-pre-line">{project.description}</div>
                    
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="text-gray-900 text-xs font-bold mr-2"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {project.highlights && (
                      <div className="text-gray-700 text-sm mt-2 leading-relaxed whitespace-pre-line">
                        {project.highlights}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  {project.githubUrl && (<>GitHub: <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {project.githubUrl}
                    </a></>
                   
                  )}
                  {project.liveUrl &&( <>在线演示: <a 
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {project.liveUrl} 
                    </a></>
                    
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 技术技能 */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            技术技能
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="text-gray-900 text-sm font-bold mr-3"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AIConfigModal() {
  const { state, dispatch } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState(state.aiConfig);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_AI_CONFIG', payload: tempConfig });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempConfig(state.aiConfig);
    setIsOpen(false);
  };

  const handleModelChange = (value: AIModel) => {
    setTempConfig({ ...tempConfig, model: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="AI配置">
          <Settings className="w-4 h-4 mr-2" />
          AI配置
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI 配置</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-url">API 地址</Label>
            <Input
              id="api-url"
              value={tempConfig.apiUrl}
              onChange={(e) => setTempConfig({ ...tempConfig, apiUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
            />
          </div>
          <div>
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={tempConfig.apiKey}
              onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
              placeholder="请输入API Key"
            />
          </div>
          <div>
            <Label htmlFor="model">模型选择</Label>
            <Select
              value={tempConfig.model}
              onValueChange={handleModelChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="border border-input bg-background hover:bg-accent "
            >
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionBar() {
  const { state, dispatch } = useAppContext();
  const { personalInfo } = state.resumeData;
  const { isOptimizing, error } = state;
  const [fitToOnePage, setFitToOnePage] = useState(true);

  const handleOptimize = async () => {
    if (!state.aiConfig.apiKey) {
      dispatch({ type: 'SET_ERROR', payload: '请先配置 AI API Key' });
      return;
    }

    dispatch({ type: 'SET_OPTIMIZING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${state.aiConfig.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.aiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: state.aiConfig.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的简历优化助手。请优化用户的简历内容，提高简洁性、专业性和竞争力。保持JSON格式返回。'
            },
            {
              role: 'user',
              content: `请优化以下简历内容：${JSON.stringify(state.resumeData)}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const optimizedContent = data.choices[0]?.message?.content;
      
      if (optimizedContent) {
        try {
          const optimizedData = JSON.parse(optimizedContent);
          dispatch({ type: 'OPTIMIZE_SUCCESS', payload: optimizedData });
        } catch {
          dispatch({ type: 'SET_ERROR', payload: 'AI返回格式错误，请重试' });
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'AI优化失败' });
    } finally {
      dispatch({ type: 'SET_OPTIMIZING', payload: false });
    }
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可撤销。')) {
      dispatch({ type: 'RESET_DATA' });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleOpenPreview = () => {
    // 打开新窗口预览页面
    const previewWindow = window.open('/preview', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    // 如果新窗口打开成功，发送当前简历数据
    if (previewWindow) {
      const sendData = () => {
        try {
          previewWindow.postMessage({
            type: 'RESUME_DATA_UPDATE',
            resumeData: state.resumeData
          }, window.location.origin);
        } catch (error) {
          console.log('Preview window not ready yet, retrying...');
        }
      };
      
      // 延迟发送数据，确保新窗口已加载完成
      setTimeout(sendData, 1000);
    }
  };

  const handleExportPDF = async () => {
    const fileName = personalInfo.name && personalInfo.phone 
      ? `${personalInfo.name}_${personalInfo.phone}.pdf`
      : 'resume.pdf';
    
    try {
      // 动态导入库以避免SSR问题
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      
      // 更精确的元素选择
      let resumeElement = document.querySelector('.resume-preview > div') as HTMLElement;
      
      // 如果找不到，尝试其他选择器
      if (!resumeElement) {
        resumeElement = document.querySelector('.resume-preview') as HTMLElement;
      }
      
      if (!resumeElement) {
        resumeElement = document.querySelector('[class*="bg-white"][class*="p-8"]') as HTMLElement;
      }
      
      if (!resumeElement) {
        dispatch({ type: 'SET_ERROR', payload: '无法找到简历预览内容，请确保已填写基本信息' });
        return;
      }

      dispatch({ type: 'SET_ERROR', payload: null });
      
      // 显示加载状态
      const originalButtonText = '导出PDF';
      const exportButton = document.querySelector('[aria-label="导出PDF"]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.textContent = '生成中...';
        exportButton.disabled = true;
      }

      // 确保元素可见
      resumeElement.style.visibility = 'visible';
      resumeElement.style.display = 'block';
      
      // 等待一下确保渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('准备截图元素:', resumeElement);
      console.log('元素尺寸:', {
        width: resumeElement.offsetWidth,
        height: resumeElement.offsetHeight,
        scrollHeight: resumeElement.scrollHeight
      });

      // 配置html2canvas选项 - 使用更简单的配置
      const canvas = await html2canvas(resumeElement, {
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: false,
        logging: true,
        removeContainer: false,
        scrollX: 0,
        scrollY: 0,
        width: resumeElement.offsetWidth * 2,
        height: resumeElement.offsetHeight * 2
      } as any);

      console.log('Canvas创建成功:', {
        width: canvas.width,
        height: canvas.height
      });

      // 检查canvas是否为空
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('生成的图片为空，请确保内容已正确渲染');
      }

      // 创建PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 5; // 减少边距从10mm到5mm
      const contentWidth = pdfWidth - 2 * margin;
      const contentHeight = pdfHeight - 2 * margin;
      
      // 计算图片尺寸
      let imgWidth = contentWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('PDF计算尺寸:', {
        imgWidth,
        imgHeight,
        contentHeight,
        fitToOnePage
      });
      
      if (fitToOnePage && imgHeight > contentHeight) {
        // 缩放以适应单页
        const scale = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
        imgWidth = imgWidth * scale;
        imgHeight = imgHeight * scale;
        
        const xOffset = margin + (contentWidth - imgWidth) / 2;
        const yOffset = margin + (contentHeight - imgHeight) / 2;
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      } else if (!fitToOnePage && imgHeight > contentHeight) {
        // 多页模式
        let currentY = 0;
        const pageHeight = contentHeight;
        
        while (currentY < imgHeight) {
          if (currentY > 0) {
            pdf.addPage();
          }
          
          const remainingHeight = imgHeight - currentY;
          const currentPageHeight = Math.min(pageHeight, remainingHeight);
          const sourceY = (currentY / imgHeight) * canvas.height;
          const sourceHeight = (currentPageHeight / imgHeight) * canvas.height;
          
          // 创建页面片段
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          
          if (pageCtx) {
            pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, currentPageHeight);
          }
          
          currentY += pageHeight;
        }
      } else {
        // 直接放置
        const xOffset = margin + (contentWidth - imgWidth) / 2;
        const yOffset = margin + (contentHeight - imgHeight) / 2;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      }

      // 保存PDF
      pdf.save(fileName);
      console.log('PDF保存成功:', fileName);
      
      // 恢复按钮状态
      if (exportButton) {
        exportButton.textContent = originalButtonText;
        exportButton.disabled = false;
      }
      
    } catch (error) {
      console.error('PDF导出失败:', error);
      dispatch({ type: 'SET_ERROR', payload: `PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}` });
      
      // 恢复按钮状态
      const exportButton = document.querySelector('[aria-label="导出PDF"]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.textContent = '导出PDF';
        exportButton.disabled = false;
      }
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white border-b">
      <AIConfigModal />
      <Button 
        onClick={handleOptimize} 
        disabled={isOptimizing}
        aria-label="AI优化简历"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {isOptimizing ? '优化中...' : 'AI优化'}
      </Button>
      <Button 
        onClick={handleExportPDF}
        variant="outline"
        aria-label="导出PDF"
      >
        <Download className="w-4 h-4 mr-2" />
        导出PDF
      </Button>
      <Button 
        onClick={handleOpenPreview}
        variant="outline"
        aria-label="新窗口预览"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        新窗口预览
      </Button>
      <Button 
        onClick={handleClearData}
        variant="outline"
        aria-label="清除所有数据"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        清除数据
      </Button>
      <div className="flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          id="fitToOnePage"
          checked={fitToOnePage}
          onChange={(e) => setFitToOnePage(e.target.checked)}
          className="rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="fitToOnePage" className="cursor-pointer text-gray-700 select-none">
          适应单页显示
        </label>
      </div>
      {error && (
        <Alert className="ml-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// 主应用组件
function ResumeBuilder() {
  const [state, dispatch] = useReducer(appReducer, getInitialState());
  
  // 自动保存功能
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage(state);
    }, AUTO_SAVE_DELAY);
    
    return () => clearTimeout(timeoutId);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-gray-50">
        <ActionBar />
        <div className="flex h-[calc(100vh-73px)]">
          {/* 左侧编辑区 */}
          <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
            <div className="space-y-6">
              <PersonalInfoEditor />
              <JobIntentionEditor />
              <WorkExperienceEditor />
              <EducationEditor />
              <OpenSourceProjectsEditor />
              <SkillsEditor />
            </div>
          </div>
          
          {/* 右侧预览区 */}
          <div className="w-1/2 p-6 overflow-y-auto bg-gray-100">
            <div className="resume-preview max-w-4xl mx-auto">
              <ResumePreview />
            </div>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default ResumeBuilder;