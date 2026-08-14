import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* 
          This is the crucial line for iOS/iPhone web apps. 
          maximum-scale=1 and user-scalable=0 prevent the browser from zooming in 
          when the user taps on text inputs, or from being manually zoomed. 
        */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" 
        />
        
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
