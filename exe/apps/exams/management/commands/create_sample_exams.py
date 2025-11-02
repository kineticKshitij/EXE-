from django.core.management.base import BaseCommand
from apps.exams.models import Exam, Question
from apps.users.models import User


class Command(BaseCommand):
    help = 'Create sample exams for testing'

    def handle(self, *args, **kwargs):
        # Get or create a user
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            user = User.objects.first()
        
        # Create Python Programming Exam
        python_exam = Exam.objects.create(
            title="Python Programming Fundamentals",
            description="Test your knowledge of Python basics including data types, loops, functions, and OOP concepts.",
            category="programming",
            difficulty="easy",
            duration_minutes=30,
            total_marks=50,
            passing_marks=25,
            is_published=True,
            is_premium=False,
            created_by=user
        )
        
        # Add questions to Python exam
        questions_data = [
            {
                "question_text": "What is the output of: print(type([]))?",
                "question_type": "mcq",
                "options": [
                    {"id": "A", "text": "<class 'list'>"},
                    {"id": "B", "text": "<class 'dict'>"},
                    {"id": "C", "text": "<class 'tuple'>"},
                    {"id": "D", "text": "<class 'set'>"}
                ],
                "correct_answer": ["A"],
                "marks": 5,
                "explanation": "The type() function returns the class type of an object. [] represents an empty list."
            },
            {
                "question_text": "Which of the following are mutable data types in Python? (Select all that apply)",
                "question_type": "multiple",
                "options": [
                    {"id": "A", "text": "List"},
                    {"id": "B", "text": "Tuple"},
                    {"id": "C", "text": "Dictionary"},
                    {"id": "D", "text": "String"}
                ],
                "correct_answer": ["A", "C"],
                "marks": 5,
                "explanation": "Lists and dictionaries are mutable, meaning they can be modified after creation. Tuples and strings are immutable."
            },
            {
                "question_text": "Python is a compiled language.",
                "question_type": "true_false",
                "options": [
                    {"id": "true", "text": "True"},
                    {"id": "false", "text": "False"}
                ],
                "correct_answer": ["false"],
                "marks": 5,
                "explanation": "Python is an interpreted language, not compiled."
            },
            {
                "question_text": "What keyword is used to define a function in Python?",
                "question_type": "mcq",
                "options": [
                    {"id": "A", "text": "function"},
                    {"id": "B", "text": "def"},
                    {"id": "C", "text": "func"},
                    {"id": "D", "text": "define"}
                ],
                "correct_answer": ["B"],
                "marks": 5,
                "explanation": "The 'def' keyword is used to define functions in Python."
            },
            {
                "question_text": "What is the output of: print(3 ** 2)?",
                "question_type": "mcq",
                "options": [
                    {"id": "A", "text": "6"},
                    {"id": "B", "text": "9"},
                    {"id": "C", "text": "5"},
                    {"id": "D", "text": "8"}
                ],
                "correct_answer": ["B"],
                "marks": 5,
                "explanation": "The ** operator is used for exponentiation. 3 ** 2 means 3 to the power of 2, which equals 9."
            }
        ]
        
        for i, q_data in enumerate(questions_data, 1):
            Question.objects.create(
                exam=python_exam,
                order=i,
                **q_data
            )
        
        # Create Data Structures Exam
        ds_exam = Exam.objects.create(
            title="Data Structures & Algorithms",
            description="Assess your understanding of fundamental data structures like arrays, linked lists, stacks, queues, and basic algorithms.",
            category="data_structures",
            difficulty="medium",
            duration_minutes=45,
            total_marks=75,
            passing_marks=38,
            is_published=True,
            is_premium=False,
            created_by=user
        )
        
        ds_questions = [
            {
                "question_text": "What is the time complexity of accessing an element in an array by index?",
                "question_type": "mcq",
                "options": [
                    {"id": "A", "text": "O(1)"},
                    {"id": "B", "text": "O(n)"},
                    {"id": "C", "text": "O(log n)"},
                    {"id": "D", "text": "O(n^2)"}
                ],
                "correct_answer": ["A"],
                "marks": 5,
                "explanation": "Array access by index is O(1) - constant time, as we can directly calculate the memory address."
            },
            {
                "question_text": "Which data structure uses FIFO (First In First Out) principle?",
                "question_type": "mcq",
                "options": [
                    {"id": "A", "text": "Stack"},
                    {"id": "B", "text": "Queue"},
                    {"id": "C", "text": "Tree"},
                    {"id": "D", "text": "Graph"}
                ],
                "correct_answer": ["B"],
                "marks": 5,
                "explanation": "Queue follows FIFO principle - the first element added is the first one to be removed."
            },
            {
                "question_text": "A binary tree where every node has 0 or 2 children is called a full binary tree.",
                "question_type": "true_false",
                "options": [
                    {"id": "true", "text": "True"},
                    {"id": "false", "text": "False"}
                ],
                "correct_answer": ["true"],
                "marks": 5,
                "explanation": "A full binary tree is one where every node has either 0 or 2 children."
            }
        ]
        
        for i, q_data in enumerate(ds_questions, 1):
            Question.objects.create(
                exam=ds_exam,
                order=i,
                **q_data
            )
        
        # Create Web Development Exam
        web_exam = Exam.objects.create(
            title="Web Development Basics",
            description="Test your knowledge of HTML, CSS, JavaScript, and web development concepts.",
            category="web_development",
            difficulty="easy",
            duration_minutes=30,
            total_marks=60,
            passing_marks=30,
            is_published=True,
            is_premium=False,
            created_by=user
        )
        
        web_questions = [
            {
                "question_text": "What does HTML stand for?",
                "question_type": "mcq",
                "options": [
                    {"id": "A", "text": "Hyper Text Markup Language"},
                    {"id": "B", "text": "High Tech Modern Language"},
                    {"id": "C", "text": "Home Tool Markup Language"},
                    {"id": "D", "text": "Hyperlinks and Text Markup Language"}
                ],
                "correct_answer": ["A"],
                "marks": 5,
                "explanation": "HTML stands for Hyper Text Markup Language."
            },
            {
                "question_text": "Which of the following are valid CSS selectors? (Select all that apply)",
                "question_type": "multiple",
                "options": [
                    {"id": "A", "text": ".class"},
                    {"id": "B", "text": "#id"},
                    {"id": "C", "text": "element"},
                    {"id": "D", "text": "@attribute"}
                ],
                "correct_answer": ["A", "B", "C"],
                "marks": 5,
                "explanation": "Class (.class), ID (#id), and element (element) are all valid CSS selectors. @attribute is not a standard selector."
            },
            {
                "question_text": "JavaScript is the same as Java.",
                "question_type": "true_false",
                "options": [
                    {"id": "true", "text": "True"},
                    {"id": "false", "text": "False"}
                ],
                "correct_answer": ["false"],
                "marks": 5,
                "explanation": "JavaScript and Java are completely different programming languages with different purposes and syntax."
            }
        ]
        
        for i, q_data in enumerate(web_questions, 1):
            Question.objects.create(
                exam=web_exam,
                order=i,
                **q_data
            )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created 3 sample exams with questions!'))
        self.stdout.write(self.style.SUCCESS(f'- {python_exam.title}: {python_exam.questions.count()} questions'))
        self.stdout.write(self.style.SUCCESS(f'- {ds_exam.title}: {ds_exam.questions.count()} questions'))
        self.stdout.write(self.style.SUCCESS(f'- {web_exam.title}: {web_exam.questions.count()} questions'))
