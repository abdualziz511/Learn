import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain, faCogs, faMagic, faCloud, faShieldAlt,
  faMicrochip, faTerminal, faSave, faSyncAlt, faCheckCircle,
  faChartBar, faUserTie
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const AISettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [model, setModel] = useState('gpt-4');
  const [sensitivity, setSensitivity] = useState(70);

  const handleSave = () => {
    Swal.fire({
      title: 'جاري الحفظ',
      html: 'يتم تحديث إعدادات الذكاء الاصطناعي...',
      timer: 1500,
      didOpen: () => Swal.showLoading(),
    }).then(() => {
      Swal.fire('تم التحديث!', 'تم حفظ التغييرات بنجاح', 'success');
    });
  };

  return (
    <div>
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>إدارة الذكاء الاصطناعي</div>
            <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, margin: 0 }}>Smart-AI Engine</h2>
            <p style={{ opacity: 0.8, marginTop: 6, marginBottom: 0 }}>التحكم في نموذج اللغة، تحليل البيانات، والمساعد الذكي</p>
          </div>
          <div className="rounded-circle p-4 bg-white bg-opacity-10 d-none d-md-block">
            <FontAwesomeIcon icon={faBrain} size="3x" className="text-white" />
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">الإعدادات الأساسية</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  style={{ width: '2.5rem', height: '1.25rem', cursor: 'pointer' }}
                />
              </div>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">النموذج المستخدم</label>
                  <select className="form-select" value={model} onChange={e => setModel(e.target.value)}>
                    <option value="gpt-4">GPT-4 Turbo (الأكثر ذكاءً)</option>
                    <option value="gpt-3.5">GPT-3.5 Turbo (الأسرع)</option>
                    <option value="claude-3">Claude 3 Opus</option>
                    <option value="gemini-pro">Gemini Pro</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">دقة التحليل</label>
                  <input
                    type="range"
                    className="form-range"
                    value={sensitivity}
                    onChange={e => setSensitivity(e.target.value)}
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>تحليل عام</span>
                    <span className="fw-bold text-primary">{sensitivity}%</span>
                    <span>دقة متناهية</span>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">مفتاح API (API Key)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><FontAwesomeIcon icon={faShieldAlt} /></span>
                    <input type="password" password="true" className="form-control" placeholder="••••••••••••••••••••••••••••" />
                    <button className="btn btn-outline-secondary">تحديث</button>
                  </div>
                  <small className="text-muted">ملاحظة: يتم تشفير المفاتيح قبل تخزينها في قاعدة البيانات</small>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header">
               <h5 className="mb-0 fw-bold">القدرات المفعلة</h5>
            </div>
            <div className="card-body">
               <div className="row g-3">
                  {[
                    { label: 'تحليل أداء الطلاب', desc: 'استخراج أنماط الضعف والقوة', icon: faChartBar, color: 'text-primary' },
                    { label: 'إنشاء الاختبارات آلياً', desc: 'توليد أسئلة بناءً على المنهج', icon: faMagic, color: 'text-warning' },
                    { label: 'التصحيح الذكي', desc: 'تقييم الإجابات المقالية', icon: faCheckCircle, color: 'text-success' },
                    { label: 'مساعد المعلم', desc: 'تخطيط الدروس والمساعدة الإدارية', icon: faUserTie, color: 'text-info' },
                  ].map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="p-3 border rounded-3 d-flex gap-3 h-100 align-items-start">
                        <div className={`stat-icon-box bg-light ${item.color}`}>
                          <FontAwesomeIcon icon={item.icon} />
                        </div>
                        <div>
                          <div className="fw-bold small">{item.label}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>{item.desc}</div>
                        </div>
                        <div className="ms-auto">
                          <input type="checkbox" className="form-check-input" defaultChecked />
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
           <div className="card border-0 shadow-sm bg-dark text-white mb-4" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="card-header border-bottom border-white border-opacity-10">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faTerminal} className="text-success" />
                  <span className="fw-bold small">حالة الاتصال بالسيرفر</span>
                </div>
              </div>
              <div className="card-body py-4">
                 <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="spinner-grow text-success" style={{ width: 12, height: 12 }} />
                    <span className="font-monospace small">Engine: online_stable_v4</span>
                 </div>
                 <div className="font-monospace small mb-2 text-success opacity-75">{'>'} Checking API keys... OK</div>
                 <div className="font-monospace small mb-2 text-success opacity-75">{'>'} Connecting to OpenAI... OK</div>
                 <div className="font-monospace small text-muted opacity-50">{'>'} Monitoring active requests: 0</div>
              </div>
           </div>

           <div className="card border-0 shadow-sm p-4 text-center">
              <div className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3 p-4" style={{ width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faMicrochip} size="3x" />
              </div>
              <h5 className="fw-bold">استهلاك الموارد</h5>
              <p className="text-muted small">إجمالي الاستهلاك لهذا الشهر</p>
              <h3 className="fw-bold text-primary">$12.45</h3>
              <div className="divider"></div>
              <button className="btn btn-primary w-100 py-3 mt-2" onClick={handleSave}>
                <FontAwesomeIcon icon={faSave} className="me-2" /> حفظ الإعدادات
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
