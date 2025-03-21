/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/pages/login-user/login-user`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/pages/login/login`; params?: Router.UnknownInputParams; } | { pathname: `/pages/register/register`; params?: Router.UnknownInputParams; } | { pathname: `/pages/roles/role`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/pages/login-user/login-user`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/pages/login/login`; params?: Router.UnknownOutputParams; } | { pathname: `/pages/register/register`; params?: Router.UnknownOutputParams; } | { pathname: `/pages/roles/role`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/pages/login-user/login-user${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/pages/login/login${`?${string}` | `#${string}` | ''}` | `/pages/register/register${`?${string}` | `#${string}` | ''}` | `/pages/roles/role${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/pages/login-user/login-user`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/pages/login/login`; params?: Router.UnknownInputParams; } | { pathname: `/pages/register/register`; params?: Router.UnknownInputParams; } | { pathname: `/pages/roles/role`; params?: Router.UnknownInputParams; };
    }
  }
}
