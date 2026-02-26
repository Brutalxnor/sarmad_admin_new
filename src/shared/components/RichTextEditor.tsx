import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
}

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean'],
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'direction', 'align',
    'link', 'image',
];

export function RichTextEditor({ value, onChange, placeholder, minHeight = '300px' }: RichTextEditorProps) {
    return (
        <div className="rich-text-editor h-full flex flex-col bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700/50 transition-colors duration-300">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="flex-1 flex flex-col dark:text-slate-200"
            />
            <style>{`
                .ql-editor {
                    min-height: ${minHeight};
                    flex: 1;
                    font-family: inherit;
                    font-size: 1rem;
                    text-align: right;
                    direction: rtl;
                }
                .ql-editor.ql-blank::before {
                    color: #94a3b8;
                    font-style: normal;
                    opacity: 0.5;
                }
                .dark .ql-editor.ql-blank::before {
                    color: #475569;
                }
                .ql-container.ql-snow {
                    border: none;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                    border-top-left-radius: 1rem;
                    border-top-right-radius: 1rem;
                }
                .dark .ql-toolbar.ql-snow {
                    border-bottom: 1px solid rgba(51, 65, 85, 0.5);
                    background: rgba(15, 23, 42, 0.3);
                }
                .ql-snow .ql-picker {
                    color: #475569;
                }
                .dark .ql-snow .ql-picker {
                    color: #94a3b8;
                }
                .ql-snow .ql-stroke {
                    stroke: #475569;
                }
                .dark .ql-snow .ql-stroke {
                    stroke: #94a3b8;
                }
                .ql-snow .ql-fill {
                    fill: #475569;
                }
                .dark .ql-snow .ql-fill {
                    fill: #94a3b8;
                }
                .ql-snow .ql-picker-options {
                    background-color: #fff;
                }
                .dark .ql-snow .ql-picker-options {
                    background-color: #1e293b;
                    border-color: #334155;
                }
            `}</style>
        </div>
    );
}
