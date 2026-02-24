import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
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

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    return (
        <div className="rich-text-editor bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:border-brand-500 transition-all">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="min-h-[200px]"
            />
            <style>{`
                .ql-editor {
                    min-height: 200px;
                    font-family: inherit;
                    font-size: 1rem;
                    text-align: right;
                    direction: rtl;
                }
                .ql-container.ql-snow {
                    border: none;
                }
                .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                }
                .ql-snow .ql-picker {
                    color: #475569;
                }
                .ql-snow .ql-stroke {
                    stroke: #475569;
                }
                .ql-snow .ql-fill {
                    fill: #475569;
                }
            `}</style>
        </div>
    );
}
