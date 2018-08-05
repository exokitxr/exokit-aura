//
//  BufferData.h
//  WorldDraw
//
//  Created by Michael Anthony on 8/4/17.
//  Copyright © 2017 Active Theory. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScript.h>

@interface BufferData : NSObject

- (void) setContext:(JSValueRef)gl withGlobal:(JSContextRef)ctx;

@end



