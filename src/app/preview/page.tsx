"use client";

import React, { useEffect, useState } from 'react';
import { ResumeData } from '@/types/resume';

// 从localStorage加载数据的函数
const loadResumeData = (): ResumeData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('resume-builder-state');
    if (saved) {
      const state = JSON.parse(saved);
      return state.resumeData;
    }
  } catch (error) {
    console.error('Failed to load resume data:', error);
  }
  return null;
};

export default function PreviewPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = loadResumeData();
    setResumeData(data);
    setLoading(false);

    // 监听来自父窗口的数据更新
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'RESUME_DATA_UPDATE') {
        setResumeData(event.data.resumeData);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    return `${year}年${month}月`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">暂无简历数据</h1>
          <p className="text-gray-600">请先在编辑页面填写简历信息</p>
        </div>
      </div>
    );
  }

  const { personalInfo, workExperience, education, openSourceProjects, skills, jobIntention, mainTechStack } = resumeData;

  return (
    // <div className="min-h-screen bg-gray-100 py-8">
    //   <div className="max-w-4xl mx-auto">
    //     <div className="mb-6 text-center">
    //       <h1 className="text-2xl font-bold text-gray-900 mb-2">简历预览</h1>
    //       <p className="text-gray-600">全屏查看您的简历效果</p>
    //     </div>
        
        <div className="resume-preview">
          <div className="bg-white p-6 shadow-lg min-h-full print:shadow-none print:p-4">
            {/* 个人信息 */}
            <div className="text-center mb-6 print:mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 print:text-2xl print:mb-3">
                {personalInfo.name || '姓名'}
              </h1>
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
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
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
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
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
                        {project.githubUrl && (
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            GitHub
                          </a>
                        )}
                        {project.liveUrl && (
                          <a 
                            href={project.liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {project.liveUrl}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 技术技能 */}
            {skills.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
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
        </div>
    //   </div>
    // </div>
  );
} 