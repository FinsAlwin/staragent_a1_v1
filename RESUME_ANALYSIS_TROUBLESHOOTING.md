# Resume Analysis Troubleshooting Guide

## Overview

This guide covers common issues with the resume analysis system and how to resolve them.

## Issues Fixed

### 1. JSON Parsing Errors ("Unexpected end of JSON input")

**Problem**: The Gemini AI service sometimes returns malformed JSON responses that cause parsing failures.

**Solutions Implemented**:

- **Retry Logic**: Added automatic retry mechanism (up to 3 attempts) for malformed responses
- **Enhanced JSON Cleaning**: Improved the `cleanJsonString` function to handle various edge cases
- **Better Error Handling**: More specific error messages for different failure types
- **Response Validation**: Comprehensive validation of AI responses before processing

**Code Location**: `services/geminiService.ts`

### 2. Internal Server Errors

**Problem**: The `/api/upload/resume` route was a placeholder that didn't actually process resumes.

**Solutions Implemented**:

- **Complete Implementation**: Replaced placeholder with full resume processing logic
- **File Parsing**: Integrated PDF and DOCX parsing services
- **Gemini Integration**: Connected to the AI analysis service
- **Proper Error Handling**: Specific error messages for different failure scenarios

**Code Location**: `app/api/upload/resume/route.ts`

### 3. Missing Error Handling

**Problem**: Generic error messages made debugging difficult.

**Solutions Implemented**:

- **Detailed Logging**: Added comprehensive logging throughout the process
- **Specific Error Codes**: Different HTTP status codes for different error types
- **User-Friendly Messages**: Clear error messages for end users
- **Frontend Validation**: Better error handling in the upload form

## Current Configuration

### Gemini Model

- **Model**: `gemini-2.5-pro` ✅
- **Package**: `@google/genai` v1.4.0 ✅
- **Configuration**: JSON response format with temperature 0.2

### File Support

- **PDF**: ✅ Supported via pdf.js
- **DOCX**: ✅ Supported via mammoth.js
- **File Size**: Up to 10MB

## Testing the System

### 1. Test Gemini API Configuration

```bash
npm run test-gemini
```

This will:

- Verify your API key is set
- Test basic content generation
- Test JSON response parsing
- Identify configuration issues

### 2. Check Environment Variables

Ensure these are set in your `.env` file:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Verify Dependencies

```bash
npm install
```

## Common Error Scenarios

### 1. "Unexpected end of JSON input"

**Causes**:

- AI model returns incomplete JSON
- Network interruption during response
- Model response format issues

**Solutions**:

- System automatically retries up to 3 times
- Enhanced JSON cleaning handles edge cases
- Check network stability

### 2. "AI analysis failed due to response format issues"

**Causes**:

- Gemini returns malformed JSON
- Response contains extra text before/after JSON
- Model doesn't follow JSON format instructions

**Solutions**:

- Automatic retry with improved prompts
- Better JSON cleaning and validation
- Check if model has access to gemini-2.5-pro

### 3. "AI service configuration error"

**Causes**:

- Missing or invalid API key
- API key doesn't have access to gemini-2.5-pro
- Quota exceeded

**Solutions**:

- Verify API key in environment variables
- Check Google AI Studio for model access
- Monitor API usage and quotas

### 4. "Failed to parse the uploaded file"

**Causes**:

- Corrupted PDF/DOCX files
- Unsupported file formats
- File parsing library issues

**Solutions**:

- Ensure files are valid PDF or DOCX
- Check file isn't password-protected
- Verify file isn't corrupted

## Debugging Steps

### 1. Check Server Logs

Look for detailed error messages in your terminal/console:

```bash
npm run dev
```

### 2. Test API Endpoints

Use tools like Postman or curl to test:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: multipart/form-data" \
  -F "resume=@test-resume.pdf" \
  -F "extractionFields=[{\"key\":\"name\",\"label\":\"Name\"}]" \
  -F "tags=[{\"name\":\"developer\"}]"
```

### 3. Verify File Parsing

Check if files are being parsed correctly by looking at console logs.

### 4. Monitor Gemini Responses

The enhanced logging will show:

- Raw AI responses
- JSON cleaning results
- Parsing attempts and failures

## Performance Optimizations

### 1. Retry Strategy

- **Initial Attempt**: Standard prompt
- **Retry 1**: Wait 1 second, same prompt
- **Retry 2**: Wait 2 seconds, same prompt
- **Final Failure**: Return detailed error

### 2. Response Validation

- Structure validation
- Field completeness check
- Type checking for all fields

### 3. Error Recovery

- Graceful degradation
- User-friendly error messages
- Automatic retry for transient issues

## Monitoring and Maintenance

### 1. API Usage

Monitor your Gemini API usage in Google AI Studio to avoid quota issues.

### 2. Error Rates

Track the frequency of JSON parsing errors to identify patterns.

### 3. Response Quality

Monitor the success rate of AI analysis to ensure quality.

## Support

If you continue to experience issues:

1. **Check the logs** for detailed error information
2. **Run the test script** to verify configuration
3. **Verify your API key** has access to gemini-2.5-pro
4. **Check file formats** are supported
5. **Monitor network stability** during uploads

## Recent Changes

- ✅ Enhanced JSON parsing with retry logic
- ✅ Improved error handling and logging
- ✅ Complete resume upload implementation
- ✅ Better frontend error messages
- ✅ Comprehensive input validation
- ✅ Automatic retry for AI failures
