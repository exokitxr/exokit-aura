//
//  BufferData.m
//  WorldDraw
//
//  Created by Michael Anthony on 8/4/17.
//  Copyright © 2017 Active Theory. All rights reserved.
//

#import <Foundation/Foundation.h>
#include <OpenGLES/EAGL.h>
#include <OpenGLES/gltypes.h>
#include <OpenGLES/ES3/gl.h>

#import "BufferData.h"

@implementation BufferData

void *JSValueGetTypedArrayPtr( JSContextRef ctx, JSValueRef value, size_t *length ) {
    JSTypedArrayType type = JSValueGetTypedArrayType(ctx, value, NULL);
    
    // Array Buffer
    if (type == kJSTypedArrayTypeArrayBuffer) {
        if (length != NULL) {
            *length = JSObjectGetArrayBufferByteLength(ctx, (JSObjectRef)value, NULL);
        }
        return JSObjectGetArrayBufferBytesPtr(ctx, (JSObjectRef)value, NULL);
    }
    
    // Typed Array
    else if (type != kJSTypedArrayTypeNone) {
        if (length != NULL) {
            *length = JSObjectGetTypedArrayByteLength(ctx, (JSObjectRef)value, NULL);
        }
        return JSObjectGetTypedArrayBytesPtr(ctx, (JSObjectRef)value, NULL);
    }
    
    if (length != NULL) {
        *length = 0;
    }
    
    return NULL;
}

JSValueRef _bufferData(JSContextRef ctx,
                       JSObjectRef function,
                       JSObjectRef thisObject,
                       size_t argumentCount,
                       const JSValueRef argv[],
                       JSValueRef* exception)
{
    GLenum target = JSValueToNumber(ctx, argv[0], NULL);
    GLenum usage = JSValueToNumber(ctx, argv[2], NULL);
    
    size_t byteLength = 0;
    const GLvoid *buffer = JSValueGetTypedArrayPtr(ctx, argv[1], &byteLength);
    glBufferData(target, byteLength, buffer, usage);
    
    return JSValueMakeNull(ctx);
}

JSValueRef _bufferSubData(JSContextRef ctx,
                       JSObjectRef function,
                       JSObjectRef thisObject,
                       size_t argumentCount,
                       const JSValueRef argv[],
                       JSValueRef* exception)
{
    GLenum target = JSValueToNumber(ctx, argv[0], NULL);
    GLintptr offset = JSValueToNumber(ctx, argv[1], NULL);
    GLsizeiptr size = JSValueToNumber(ctx, argv[2], NULL);
    
    size_t byteLength = 0;
    const GLvoid *buffer = JSValueGetTypedArrayPtr(ctx, argv[3], &byteLength);
    glBufferSubData(target, offset, size, buffer);
    
    return JSValueMakeNull(ctx);
}

- (void) setContext:(JSValueRef)gl withGlobal:(JSContextRef)ctx {
    JSStringRef bufferData = JSStringCreateWithUTF8CString("C_glBufferData");
    JSObjectRef bufferDataRef = JSObjectMakeFunctionWithCallback(ctx, bufferData, _bufferData);
    JSObjectSetProperty(ctx, JSContextGetGlobalObject(ctx), bufferData, bufferDataRef, kJSPropertyAttributeNone, NULL);
    JSStringRelease(bufferData);
    
    JSStringRef bufferSubData = JSStringCreateWithUTF8CString("C_glBufferSubData");
    JSObjectRef bufferSubDataRef = JSObjectMakeFunctionWithCallback(ctx, bufferSubData, _bufferSubData);
    JSObjectSetProperty(ctx, JSContextGetGlobalObject(ctx), bufferSubData, bufferSubDataRef, kJSPropertyAttributeNone, NULL);
    JSStringRelease(bufferSubData);
}

@end



