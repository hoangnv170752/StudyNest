import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CodeIcon from '@mui/icons-material/Code';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CreateIcon from '@mui/icons-material/Create';
import SchoolIcon from '@mui/icons-material/School';

export interface PromptSuggestion {
  icon: React.ComponentType;
  label: string;
  prompt: string;
}

export const suggestions: PromptSuggestion[] = [
  {
    icon: LightbulbIcon,
    label: 'Brainstorm',
    prompt: 'Help me brainstorm creative ideas for [your project, topic, or problem]. I need innovative solutions that consider [specific constraints or requirements].',
  },
  {
    icon: CodeIcon,
    label: 'Code',
    prompt: 'Write clean, well-documented code to [describe the functionality you need]. Please include error handling and follow best practices for [programming language or framework].',
  },
  {
    icon: SummarizeIcon,
    label: 'Summarize',
    prompt: 'Summarize the following text in [number] key points, focusing on [main themes, conclusions, or specific aspects]: [paste your text here]',
  },
  {
    icon: TipsAndUpdatesIcon,
    label: 'Get advice',
    prompt: 'Give me practical advice on [specific situation or challenge]. Consider my context: [relevant background information] and suggest actionable steps.',
  },
  {
    icon: SchoolIcon,
    label: 'Explain concept',
    prompt: 'Explain [complex topic or concept] in simple terms. Break it down step-by-step and include examples to help me understand [specific aspect you want to focus on].',
  },
  {
    icon: CreateIcon,
    label: 'Write content',
    prompt: 'Write a [type of content: essay, article, poem, story] about [topic]. The tone should be [formal/casual/creative] and approximately [word count] words long. Key points to include: [list main ideas].',
  },
];
