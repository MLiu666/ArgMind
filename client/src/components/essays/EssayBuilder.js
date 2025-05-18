import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

const steps = ['Thesis', 'Arguments', 'Conclusion'];

const EssayBuilder = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [essay, setEssay] = useState({
    title: '',
    thesis: '',
    arguments: [{ claim: '', evidence: '', reasoning: '' }],
    conclusion: '',
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddArgument = () => {
    setEssay((prevEssay) => ({
      ...prevEssay,
      arguments: [...prevEssay.arguments, { claim: '', evidence: '', reasoning: '' }],
    }));
  };

  const handleRemoveArgument = (index) => {
    setEssay((prevEssay) => ({
      ...prevEssay,
      arguments: prevEssay.arguments.filter((_, i) => i !== index),
    }));
  };

  const handleArgumentChange = (index, field, value) => {
    setEssay((prevEssay) => ({
      ...prevEssay,
      arguments: prevEssay.arguments.map((arg, i) =>
        i === index ? { ...arg, [field]: value } : arg
      ),
    }));
  };

  const renderThesisStep = () => (
    <Box sx={{ mt: 3 }}>
      <TextField
        fullWidth
        label="Essay Title"
        value={essay.title}
        onChange={(e) => setEssay({ ...essay, title: e.target.value })}
        margin="normal"
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Thesis Statement"
          value={essay.thesis}
          onChange={(e) => setEssay({ ...essay, thesis: e.target.value })}
          margin="normal"
        />
        <Tooltip title="A thesis statement should clearly state your main argument and preview the key points you'll discuss">
          <IconButton sx={{ ml: 1 }}>
            <HelpIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const renderArgumentsStep = () => (
    <Box sx={{ mt: 3 }}>
      {essay.arguments.map((arg, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Argument {index + 1}</Typography>
              {essay.arguments.length > 1 && (
                <IconButton onClick={() => handleRemoveArgument(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            <TextField
              fullWidth
              label="Claim"
              value={arg.claim}
              onChange={(e) => handleArgumentChange(index, 'claim', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Evidence"
              value={arg.evidence}
              onChange={(e) => handleArgumentChange(index, 'evidence', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reasoning"
              value={arg.reasoning}
              onChange={(e) => handleArgumentChange(index, 'evidence', e.target.value)}
              margin="normal"
            />
          </CardContent>
        </Card>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddArgument}
        variant="outlined"
        sx={{ mt: 2 }}
      >
        Add Argument
      </Button>
    </Box>
  );

  const renderConclusionStep = () => (
    <Box sx={{ mt: 3 }}>
      <TextField
        fullWidth
        multiline
        rows={6}
        label="Conclusion"
        value={essay.conclusion}
        onChange={(e) => setEssay({ ...essay, conclusion: e.target.value })}
        margin="normal"
        helperText="Summarize your main points and reinforce your thesis"
      />
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderThesisStep();
      case 1:
        return renderArgumentsStep();
      case 2:
        return renderConclusionStep();
      default:
        return 'Unknown step';
    }
  };

  const handleSubmit = () => {
    // TODO: Implement essay submission
    console.log('Essay submitted:', essay);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Essay Builder
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit Essay
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EssayBuilder; 