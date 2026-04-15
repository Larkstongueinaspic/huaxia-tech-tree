/* ============================================================
 * SearchModal.jsx
 * 节点搜索模态框组件
 * 
 * 功能：
 * - 按 Cmd+K / Ctrl+K 打开
 * - 模糊搜索节点名称、英文名、描述
 * - 点击结果自动聚焦到节点
 * - 按 ESC 关闭
 * ============================================================ */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import './SearchModal.css';

/**
 * 简单的模糊搜索实现
 * @param {string} query - 搜索查询
 * @param {array} nodes - 节点数组
 * @returns {array} - 搜索结果
 */
function fuzzySearch(query, nodes) {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  
  const scored = nodes.map(node => {
    let score = 0;
    
    // 检查节点名（中文）
    if (node.name.toLowerCase().includes(lowerQuery)) {
      score += 10;
      if (node.name.toLowerCase().startsWith(lowerQuery)) {
        score += 5;
      }
    }
    
    // 检查英文名
    if (node.en && node.en.toLowerCase().includes(lowerQuery)) {
      score += 8;
      if (node.en.toLowerCase().startsWith(lowerQuery)) {
        score += 4;
      }
    }
    
    // 检查描述
    if (node.desc && node.desc.toLowerCase().includes(lowerQuery)) {
      score += 3;
    }
    
    // 检查发明者
    if (node.inv && node.inv.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }
    
    return { node, score };
  });

  // 过滤有效结果并按 score 排序
  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20) // 最多显示 20 个结果
    .map(({ node }) => node);
}

/**
 * 格式化年份显示
 */
function formatYear(year) {
  if (!year) return '';
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year} AD`;
}

export function SearchModal({ NODES, CAT, onSelect, isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // 搜索结果
  const results = useMemo(() => {
    return fuzzySearch(query, NODES);
  }, [query, NODES]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // 键盘导航
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(idx => Math.min(idx + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(idx => Math.max(idx - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      default:
        break;
    }
  };

  // 处理结果选择
  const handleSelectResult = (node) => {
    onSelect(node.id);
    onClose();
    setQuery('');
  };

  // 点击结果
  const handleResultClick = (node) => {
    handleSelectResult(node);
  };

  // 悬停结果
  const handleResultHover = (index) => {
    setSelectedIndex(index);
  };

  // 监听全局键盘事件
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Cmd+K 或 Ctrl+K 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // 这里需要从父组件传递打开函数
          // 临时方案：通过事件
          window.dispatchEvent(new CustomEvent('openSearch'));
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className="search-modal-overlay" onClick={onClose} />
      
      {/* 搜索框容器 */}
      <div className="search-modal-container">
        <div className="search-modal">
          {/* 搜索输入框 */}
          <div className="search-modal-input-wrapper">
            <svg className="search-modal-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="search-modal-input"
              placeholder="搜索节点..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button
                className="search-modal-clear"
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(-1);
                  inputRef.current?.focus();
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* 搜索结果列表 */}
          <div className="search-modal-results" ref={resultsRef}>
            {results.length === 0 ? (
              <div className="search-modal-empty">
                {query.trim() ? '🔍 未找到匹配的节点' : '📌 开始输入以搜索节点'}
              </div>
            ) : (
              <ul className="search-modal-list">
                {results.map((node, idx) => (
                  <li
                    key={node.id}
                    className={`search-modal-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleResultClick(node)}
                    onMouseEnter={() => handleResultHover(idx)}
                  >
                    <div className="search-modal-item-main">
                      <div className="search-modal-item-name">{node.name}</div>
                      <div className="search-modal-item-en">{node.en}</div>
                    </div>
                    <div className="search-modal-item-meta">
                      <span className="search-modal-item-category">
                        {CAT[node.cat]?.label || node.cat}
                      </span>
                      <span className="search-modal-item-year">
                        {formatYear(node.year)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 帮助提示 */}
          {query === '' && (
            <div className="search-modal-help">
              <div className="search-modal-help-item">
                <span className="search-modal-help-key">↓↑</span>
                <span>导航</span>
              </div>
              <div className="search-modal-help-item">
                <span className="search-modal-help-key">Enter</span>
                <span>选择</span>
              </div>
              <div className="search-modal-help-item">
                <span className="search-modal-help-key">Esc</span>
                <span>关闭</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
