from django.conf.urls import url, patterns, include
from abstractAardvark import apiviews, webviews
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = (
    url(r'^game/$',webviews.load_game),
    url(r'^trees/$', webviews.tree_detail),
    url(r'^api/games/$', apiviews.game_list),
    url(r'^api/games/(?P<pk>[0-9]+)/$', apiviews.game_detail),
    url(r'^api/games/start((?:/(?P<pk>[0-9]+))|(?:/(?P<diff>[a-z]+)))?/$', apiviews.game_control),
    url(r'^api/games/(?P<username>[a-zA-Z]{1,1}[a-zA-z0-9_]{0,29})/$',apiviews.user_games),
    url(r'^login/', webviews.login),
    url(r'^register/', webviews.register),
)

urlpatterns = format_suffix_patterns(urlpatterns)
urlpatterns += [
	url(r'^api-auth/', include('rest_framework.urls', namespace = 'rest_framework')),
]
