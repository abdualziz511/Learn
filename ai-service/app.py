import os
import json
import random
from http.server import HTTPServer, BaseHTTPRequestHandler

# Security settings
SECRET_KEY = os.environ.get("AI_SECRET_KEY", "internal-ai-secret")

class AIServiceHandler(BaseHTTPRequestHandler):
    def send_json(self, data, status_code=200):
        response_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_POST(self):
        # Verify Token
        auth_header = self.headers.get("X-AI-Secret-Key")
        if not auth_header or auth_header != SECRET_KEY:
            self.send_json({"status": "error", "message": "Unauthorized access"}, 401)
            return

        # Parse request body
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception:
            data = {}

        if self.path == '/ai/analyze-student':
            self.analyze_student(data)
        elif self.path == '/ai/generate-exam':
            self.generate_exam(data)
        elif self.path == '/ai/grade-answer':
            self.grade_answer(data)
        elif self.path == '/ai/school-insights':
            self.school_insights(data)
        else:
            self.send_json({"status": "error", "message": "Endpoint not found"}, 404)

    def analyze_student(self, data):
        student_id = data.get("student_id")
        grades = data.get("grades", [])
        attendance = data.get("attendance", {})

        if not student_id:
            self.send_json({"status": "error", "message": "Missing student_id"}, 400)
            return

        # Calculate overall stats
        total_score = 0
        total_max = 0
        subject_averages = {}

        for grade in grades:
            sub = grade.get("subject", "General")
            scores = grade.get("scores", [])
            max_val = grade.get("max", 100)
            if scores:
                avg_score = sum(scores) / len(scores)
                pct = (avg_score / max_val) * 100
                subject_averages[sub] = pct
                total_score += avg_score
                total_max += max_val
            else:
                subject_averages[sub] = 0

        overall_score = (total_score / total_max * 100) if total_max > 0 else 0.0

        # Calculate attendance
        total_days = attendance.get("total_days", 0)
        present_days = attendance.get("present_days", 0)
        attendance_rate = (present_days / total_days * 100) if total_days > 0 else 100.0

        # Determine strong & weak subjects
        strong_subjects = []
        weak_subjects = []
        for sub, score in subject_averages.items():
            if score >= 75:
                strong_subjects.append(sub)
            else:
                weak_subjects.append(sub)

        # Determine risk level
        if overall_score < 50 or attendance_rate < 75:
            risk_level = "high"
        elif overall_score < 75 or attendance_rate < 85:
            risk_level = "medium"
        else:
            risk_level = "low"

        # Generate custom recommendations
        recommendations = []
        if risk_level == "high":
            recommendations.append({
                "subject": "عام",
                "priority": "high",
                "message": "نسبة الحضور أو المعدل العام متدنية جداً. يجب عقد اجتماع عاجل مع ولي الأمر والإدارة لوضع خطة تحسين."
            })

        for ws in weak_subjects:
            recommendations.append({
                "subject": ws,
                "topics": ["الأساسيات", "مراجعة الاختبارات السابقة"],
                "priority": "medium" if risk_level == "medium" else "high",
                "message": f"يحتاج الطالب لتركيز إضافي في مادة {ws} ومراجعة الواجبات اليومية بشكل دوري."
            })

        if not recommendations:
            recommendations.append({
                "subject": "عام",
                "priority": "low",
                "message": "أداء الطالب ممتاز ومستقر. ينصح بالاستمرار على هذا النهج وتجربة تحديات إضافية."
            })

        self.send_json({
            "overall_score": round(overall_score, 2),
            "attendance_rate": round(attendance_rate, 2),
            "risk_level": risk_level,
            "strong_subjects": strong_subjects,
            "weak_subjects": weak_subjects,
            "recommendations": recommendations
        })

    def generate_exam(self, data):
        subject = data.get("subject", "الرياضيات")
        scope = data.get("scope", "unit")
        scope_ref = data.get("scope_ref", "الوحدة الأولى")
        count = int(data.get("question_count", 10))

        templates = {
            "الرياضيات": [
                ("ما هي قيمة س في المعادلة: 2س + 5 = 15؟", "mcq", ["5", "10", "15", "20"], "5"),
                ("إذا كان قطر الدائرة يساوي 10 سم، فكم يكون نصف قطرها؟", "mcq", ["5 سم", "10 سم", "20 سم", "15 سم"], "5 سم"),
                ("المربع هو شكل هندسي له أربعة أضلاع متساوية في الطول وقائمة الزوايا.", "true_false", ["صح", "خطأ"], "صح"),
                ("حاصل ضرب أي عدد في صفر هو صفر.", "true_false", ["صح", "خطأ"], "صح"),
                ("اكتب قانون مساحة المثلث الهندسية.", "short_answer", [], "نصف القاعدة في الارتفاع"),
                ("اشرح كيفية حساب المتوسط الحسابي لمجموعة من الأرقام مع كتابة مثال.", "essay", [], "جمع الأرقام وقسمتها على عددها")
            ],
            "اللغة العربية": [
                ("الفاعل في الجملة الفعلية يكون دائماً:", "mcq", ["مرفوعاً", "منصوباً", "مجروراً", "مجزوماً"], "مرفوعاً"),
                ("ما هو جمع كلمة 'قلم'؟", "mcq", ["أقلام", "قلمات", "قالمون", "مقالم"], "أقلام"),
                ("تعتبر 'إنّ' وأخواتها حروفاً ناسخة تدخل على الجملة الاسمية فتنصب المبتدأ وترفع الخبر.", "true_false", ["صح", "خطأ"], "صح"),
                ("الفعل الماضي يبنى دائماً على الفتح الظاهر إذا لم يتصل به شيء.", "true_false", ["صح", "خطأ"], "صح"),
                ("اكتب بيت شعر مشهور للمتنبي واشرح معناه بايجاز.", "essay", [], "الخيل والليل والبيداء تعرفني"),
                ("ما هي أدوات الجزم للفعل المضارع؟", "short_answer", [], "لم، لما، لام الأمر، لا الناهية")
            ],
            "العلوم": [
                ("ما هو الكوكب الأقرب إلى الشمس في المجموعة الشمسية؟", "mcq", ["عطارد", "الزهرة", "الأرض", "المريخ"], "عطارد"),
                ("ما هو الغاز الضروري لعملية التنفس عند الكائنات الحية؟", "mcq", ["الأكسجين", "نيتروجين", "ثاني أكسيد الكربون", "الهيدروجين"], "الأكسجين"),
                ("الماء يتكون من ذرتي هيدروجين وذرة أكسجين.", "true_false", ["صح", "خطأ"], "صح"),
                ("تنتقل الحرارة في الفراغ عن طريق الحمل الحراري.", "true_false", ["صح", "خطأ"], "خطأ"),
                ("ما هي الوظيفة الأساسية للميتوكوندريا في الخلية الحية? ", "short_answer", [], "إنتاج الطاقة للخلية"),
                ("اشرح بالتفصيل عملية البناء الضوئي في النباتات الخضراء وأهميتها للبيئة.", "essay", [], "تحويل الطاقة الضوئية إلى طاقة كيميائية لصنع الغذاء")
            ]
        }

        fallback_templates = [
            ("سؤال تجريبي رقم 1 في مادة " + subject, "mcq", ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], "خيار 1"),
            ("تعتبر هذه العبارة تجريبية صحيحة.", "true_false", ["صح", "خطأ"], "صح"),
            ("اكتب تعليقاً مختصراً حول موضوع " + scope_ref, "short_answer", [], "إجابة نموذجية نموذجية"),
            ("اكتب مقالاً مفصلاً تشرح فيه أهمية " + scope_ref, "essay", [], "محتوى إرشادي مفصل")
        ]

        selected_templates = templates.get(subject, fallback_templates)
        questions = []

        for i in range(count):
            tpl = random.choice(selected_templates)
            questions.append({
                "question": f"{tpl[0]} (توليد ذكي - {i+1})",
                "type": tpl[1],
                "options": tpl[2] if tpl[2] else None,
                "answer": tpl[3],
                "score": 1.0,
                "order_num": i + 1
            })

        self.send_json({
            "subject": subject,
            "scope": scope,
            "scope_ref": scope_ref,
            "questions": questions
        })

    def grade_answer(self, data):
        question = data.get("question", "")
        student_answer = str(data.get("student_answer", "")).strip().lower()
        correct_answer = str(data.get("correct_answer", "")).strip().lower()
        q_type = data.get("type", "short_answer")
        max_score = float(data.get("max_score", 1.0))

        if not student_answer:
            self.send_json({
                "is_correct": False,
                "score": 0.0,
                "ai_feedback": "لا توجد إجابة مقدمة من الطالب."
            })
            return

        if q_type in ["mcq", "true_false"]:
            is_correct = (student_answer == correct_answer)
            score = max_score if is_correct else 0.0
            self.send_json({
                "is_correct": is_correct,
                "score": score,
                "ai_feedback": "تصحيح تلقائي مباشر." if is_correct else f"الإجابة غير صحيحة. الإجابة النموذجية هي: {correct_answer}"
            })
            return

        student_tokens = set(student_answer.split())
        correct_tokens = set(correct_answer.split())

        if not correct_tokens:
            intersection_pct = 1.0
        else:
            intersection = student_tokens.intersection(correct_tokens)
            intersection_pct = len(intersection) / len(correct_tokens)

        if student_answer == correct_answer:
            score = max_score
            is_correct = True
            feedback = "إجابة ممتازة ومطابقة تماماً للنموذج."
        elif intersection_pct >= 0.7:
            score = max_score * 0.9
            is_correct = True
            feedback = "إجابة صحيحة بشكل عام وتحتوي على جميع المفاهيم الأساسية المطلوبة."
        elif intersection_pct >= 0.4:
            score = max_score * 0.5
            is_correct = False
            feedback = "الإجابة متوسطة. تم ذكر بعض النقاط ولكنها تفتقر للشمولية."
        else:
            score = 0.0
            is_correct = False
            feedback = f"الإجابة غير دقيقة. الإجابة النموذجية المتوقعة تقارب: {correct_answer}"

        self.send_json({
            "is_correct": is_correct,
            "score": round(score, 2),
            "ai_feedback": feedback
        })

    def school_insights(self, data):
        school_name = data.get("school_name", "المدرسة")
        performance_summary = data.get("performance_summary", {})

        gpa = performance_summary.get("average_gpa", 75.0)
        attendance = performance_summary.get("average_attendance", 90.0)

        insights = []
        if gpa < 70:
            insights.append("ملاحظة تدني التحصيل العلمي العام للطلاب. يوصى بزيادة الحصص التدريبية والتقييمات القصيرة.")
        if attendance < 85:
            insights.append("هناك غياب متكرر ملحوظ. يجب تفعيل نظام الإنذارات المبكرة والاتصال التلقائي بأولياء الأمور.")

        insights.append(f"أداء مميز في بعض المواد العلمية مقارنة بالمواد الأدبية في مدرسة {school_name}.")

        self.send_json({
            "general_status": "مستقر" if gpa >= 70 else "يحتاج لمتابعة",
            "insights": insights,
            "suggestions": [
                "تنظيم ورش عمل تفاعلية للمعلمين لتحسين مهارات التدريس.",
                "متابعة الطلاب ذوي الحضور المتدني بشكل يومي."
            ]
        })

def run(server_class=HTTPServer, handler_class=AIServiceHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting standard library HTTP AI server on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    print("Stopping server...")

if __name__ == '__main__':
    run()
