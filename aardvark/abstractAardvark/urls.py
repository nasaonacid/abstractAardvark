from django.conf.urls import url, patterns, include
from abstractAardvark import apiviews, webviews
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = (
    url(r'^game/$',webviews.load_game),
    url(r'^api/games/$', apiviews.game_list),
    url(r'^api/games/start((?:/(?P<pk>[0-9]+))|(?:/(?P<diff>[a-z]+)))?/$', apiviews.game_detail),
)

urlpatterns = format_suffix_patterns(urlpatterns)
# urlpatterns += [
# 	url(r'^api-auth/', include('rest_framework.urls', namespace = 'rest_framework')),
# ]
